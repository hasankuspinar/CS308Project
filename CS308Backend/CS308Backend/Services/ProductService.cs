using System.Collections.Generic;
using System.Threading.Tasks;
using CS308Backend.Models;
using CS308Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CS308Backend.Services
{
    public interface IProductService
    {
        // Product methods
        Task<IEnumerable<Product>> GetAllProductsAsync();
        Task<Product> GetProductByIdAsync(int id);
        Task<Product> AddProductAsync(ProductDto productdto);
        Task<Product> UpdateProductQuantityAsync(int productId, int newQuantity);
        Task<bool> DeleteProductAsync(int id);
        Task<IEnumerable<Product>> SearchAndSortProductsAsync(string? search, string? sortBy, string? sortOrder);
        Task<Category> AddCategoryAsync(string categoryName);
        Task<bool> DeleteCategoryAsync(int categoryId);
        Task<Category> GetCategoryByIdAsync(int id);
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task SetPriceAsync(int productId, double newPrice);
        Task ApplyDiscountAsync(List<int> productIds, double discountPercentage);
        Task<Product> UpdateProductPriceAsync(int productId, double newPrice);
        Task<IEnumerable<Product>> GetAllProductsWithZeroPriceAsync();


        // Comment methods
        Task<IEnumerable<Comment>> GetCommentsByProductIdAsync(int productId);
        Task<IEnumerable<Comment>> GetAllCommentsAsync();
        Task<Comment> AddCommentAsync(int productId, int userId, string productComment);
        Task<Comment> UpdateCommentAsync(Comment comment);
        Task<Comment> GetCommentByIdAsync(int id);

        // Rating methods
        Task<IEnumerable<Rating>> GetRatingsByProductIdAsync(int productId);
        Task<Rating> AddRatingAsync(int productId, int userId, double ratingValue);

        // Wishlist methods
        Task<Wishlist> AddToWishlistAsync(int productId, int userId);
        Task<IEnumerable<Wishlist>> GetWishlistByUserIdAsync(int userId);
        Task<bool> RemoveFromWishlistAsync(int wishId);
    }

    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ICommentRepository _commentRepository;
        private readonly IRatingRepository _ratingRepository;
        private readonly IPurchaseRepository _purchaseRepository;
        private readonly IDeliveryRepository _deliveryRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IWishlistRepository _wishlistRepository;
        private readonly IUserRepository    _userRepository;
        private readonly IEmailService _emailService;
        public ProductService(IProductRepository productRepository, ICommentRepository commentRepository, IRatingRepository ratingRepository, IPurchaseRepository purchaseRepository, IDeliveryRepository deliveryRepository, ICategoryRepository categoryRepository, IWishlistRepository wishlistRepository, IUserRepository userRepository, IEmailService emailService)
        {
            _productRepository = productRepository;
            _commentRepository = commentRepository;
            _ratingRepository = ratingRepository;
            _purchaseRepository = purchaseRepository;
            _deliveryRepository = deliveryRepository;
            _categoryRepository = categoryRepository;
            _wishlistRepository = wishlistRepository;
            _userRepository     = userRepository;
            _emailService       = emailService; 
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            return await _productRepository.GetAllProductsAsync();
        }

        public async Task<IEnumerable<Product>> GetAllProductsWithZeroPriceAsync()
        {
            return await _productRepository.GetAllProductsWithZeroPriceAsync();
        }

        public async Task<Product> GetProductByIdAsync(int id)
        {
            return await _productRepository.GetProductByIdAsync(id);
        }

        public async Task<Product> AddProductAsync(ProductDto productdto)
        {
            var product = new Product
            {
                ProductName = productdto.ProductName,
                Model = productdto.Model,
                SerialNumber = productdto.SerialNumber,
                Description = productdto.Description,
                Quantity = productdto.Quantity,
                Price = productdto.Price,
                OldPrice = productdto.Price,
                Distributor = productdto.Distributor,
                WarrantyStatus = productdto.WarrantyStatus,
                ImageURL = productdto.ImageURL,
                CategoryId = productdto.CategoryId
            };

            return await _productRepository.AddProductAsync(product);
        }

        public async Task<Product> UpdateProductQuantityAsync(int productId, int newQuantity)
        {
            var product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null) return null;

            product.Quantity = newQuantity;
            return await _productRepository.UpdateProductAsync(product);
        }


        public async Task<bool> DeleteProductAsync(int id)
        {
            return await _productRepository.DeleteProductAsync(id);
        }
        public async Task<IEnumerable<Product>> SearchAndSortProductsAsync(string? search, string? sortBy, string? sortOrder)
        {
            return await _productRepository.SearchAndSortProductsAsync(search, sortBy, sortOrder);
        }
        public async Task<Category> AddCategoryAsync(string categoryName)
        {
            if (string.IsNullOrWhiteSpace(categoryName))
                return null;

            var newCategory = new Category
            {
                CategoryName = categoryName
            };

            return await _categoryRepository.AddCategoryAsync(newCategory);
        }
        public async Task<bool> DeleteCategoryAsync(int categoryId)
        {
            return await _categoryRepository.RemoveCategoryAsync(categoryId);
        }
        public async Task<Category> GetCategoryByIdAsync(int id)
        {
            return await _categoryRepository.GetCategoryByIdAsync(id);
        }
        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            return await _categoryRepository.GetAllCategoriesAsync();
        }

        public async Task SetPriceAsync(int productId, double newPrice){

            var product = await _productRepository.GetProductByIdAsync(productId);

            if (product == null)
               throw new KeyNotFoundException("Product not found");

            product.Price = newPrice;
            product.OldPrice = product.Price;
            await _productRepository.UpdateProductAsync(product);
        }

        public async Task ApplyDiscountAsync(List<int> productIds, double discountPercentage)
        {
            if (discountPercentage <= 0 || discountPercentage >= 100)
                throw new ArgumentException("Discount percentage must be between 0 and 100.");

            foreach (var productId in productIds)
            {
                var product = await _productRepository.GetProductByIdAsync(productId);
                if (product == null) continue;

                if (product.OldPrice == 0)
                    product.OldPrice = product.Price; 

                product.Price = Math.Round(product.OldPrice * (1 - discountPercentage / 100), 2);

                await _productRepository.UpdateProductAsync(product);

                var wishlistItems = await _wishlistRepository.GetWishlistByProductIdAsync(productId);

                foreach (var wish in wishlistItems)
                {
                    var user = await _userRepository.GetUserById(wish.UserId);
                    if (user == null || string.IsNullOrWhiteSpace(user.Email)) continue;

                    var subject = $"🔥 Discount Alert: {product.ProductName}";
                    var body = $"""
                Hi {user.Name},

                Good news! The product "{product.ProductName}" that you added to your wishlist has a new discounted price.

                Old Price: ${product.OldPrice:F2}
                New Price: ${product.Price:F2}

                Visit our store now and grab the deal before it's gone!

                Best regards,
                CHANTA Team
                """;

                    await _emailService.SendEmailAsync(user.Email, subject, body);
                }
            }
        }

        public async Task<Product> UpdateProductPriceAsync(int productId, double newPrice)
        {
            var product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null) return null;

            var oldPrice = product.Price;
            product.Price = newPrice;
            var updated = await _productRepository.UpdateProductAsync(product);

            if (newPrice < oldPrice)
            {
                var wishlistItems = await _wishlistRepository
                                            .GetWishlistByProductIdAsync(productId);

                foreach (var wish in wishlistItems)
                {
                    var user = await _userRepository.GetUserById(wish.UserId);
                    if (user == null || string.IsNullOrWhiteSpace(user.Email))
                        continue;

                    var subject = $"Discount: {product.ProductName}";
                    var body    = $@"  Hey {user.Name}, the product {product.ProductName} had a discount and we wanted to notify you";

                    await _emailService.SendEmailAsync(user.Email, subject, body);
                }
            }

            return updated;
        }


        // =========================
        // COMMENT METHODS
        // =========================

        public async Task<IEnumerable<Comment>> GetCommentsByProductIdAsync(int productId)
        {
            var comments = await _commentRepository.GetCommentsByProductIdAsync(productId);
            return comments.Where(c => c.Status == (int)CommentStatus.Approved).ToList();
        }
        public async Task<IEnumerable<Comment>> GetAllCommentsAsync()
        {
            var comments = await _commentRepository.GetAllCommentsAsync();
            return comments;
        }

        public async Task<Comment> AddCommentAsync(int productId, int userId, string productComment)
        {
            var product = await _productRepository.GetProductByIdAsync(productId);
            var purchases = await _purchaseRepository.GetPurchasesByUserIdAsync(userId);
            var deliveries = await _deliveryRepository.GetDeliveriesByUserIdAsync(userId);

            bool hasPurchased = purchases.Any(p => p.ProductId == productId);
            bool isDelivered = deliveries.Any(d => d.ProductID == productId && d.Status == DeliveryStatus.Delivered);
            var alreadyCommented = (await _commentRepository.GetCommentsByProductIdAsync(productId))
                .Any(c => c.UserId == userId);

            if (product == null || !hasPurchased || !isDelivered || alreadyCommented)
                return null;

            var comment = new Comment
            {
                ProductId = productId,
                UserId = userId,
                ProductComment = productComment,
                Status = 1
            };

            return await _commentRepository.AddCommentAsync(comment);
        }

        public async Task<Comment> GetCommentByIdAsync(int id)
        {
            return await _commentRepository.GetCommentByIdAsync(id);
        }

        public async Task<Comment> UpdateCommentAsync(Comment comment)
        {
            return await _commentRepository.UpdateCommentAsync(comment);
        }

        // =========================
        // RATING METHODS
        // =========================

        public async Task<IEnumerable<Rating>> GetRatingsByProductIdAsync(int productId)
        {
            return await _ratingRepository.GetRatingsByProductIdAsync(productId);
        }

        public async Task<Rating> AddRatingAsync(int productId, int userId, double ratingValue)
        {
            var product = await _productRepository.GetProductByIdAsync(productId);
            var purchases = await _purchaseRepository.GetPurchasesByUserIdAsync(userId);
            var deliveries = await _deliveryRepository.GetDeliveriesByUserIdAsync(userId);

            bool hasPurchased = purchases.Any(p => p.ProductId == productId);
            bool isDelivered = deliveries.Any(d => d.ProductID == productId && d.Status == DeliveryStatus.Delivered);
            var alreadyRated = (await _ratingRepository.GetRatingsByProductIdAsync(productId))
                .Any(r => r.UserId == userId);

            if (product == null || !hasPurchased || !isDelivered || alreadyRated)
                return null;

            var rating = new Rating
            {
                ProductId = productId,
                UserId = userId,
                ProductRating = ratingValue
            };

            return await _ratingRepository.AddRatingAsync(rating);
        }


        // =========================
        // Wishlist Methods
        // =========================
        public async Task<Wishlist> AddToWishlistAsync(int productId, int userId)
        {
            var product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null) return null;

            var existingWishlist = (await _wishlistRepository.GetWishlistByUserId(userId))
                .FirstOrDefault(w => w.ProductId == productId);
            if (existingWishlist != null) return existingWishlist;

            var wishlistItem = new Wishlist
            {
                ProductId = productId,
                UserId = userId
            };

            return await _wishlistRepository.AddToWishlist(wishlistItem);
        }

        public async Task<IEnumerable<Wishlist>> GetWishlistByUserIdAsync(int userId)
        {
            return await _wishlistRepository.GetWishlistByUserId(userId);
        }

        public async Task<bool> RemoveFromWishlistAsync(int wishId)
        {
            return await _wishlistRepository.RemoveFromWishlist(wishId);
        }
    }
}
