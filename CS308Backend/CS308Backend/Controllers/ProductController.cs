using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CS308Backend.Models;
using CS308Backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace CS308Backend.Controllers
{
    [ApiController]
    [Route("/products")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IPurchaseService _purchaseService;

        public ProductController(IProductService productService, IPurchaseService purchaseService)
        {
            _productService = productService;
            _purchaseService = purchaseService;
        }

        // =========================
        // PRODUCT METHODS
        // =========================

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetAllProducts()
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }

        [HttpGet("priceless")]
        public async Task<ActionResult<IEnumerable<Product>>> GetAllProductsWithouPrice()
        {
            var products = await _productService.GetAllProductsWithZeroPriceAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProductById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] ProductDto productdto)
        {
            var newProduct = await _productService.AddProductAsync(productdto);
            return CreatedAtAction(nameof(GetProductById), new { id = newProduct.Id }, newProduct);
        }

        [Authorize(Roles = "ProductManager")]
        [HttpPut("{id}/quantity")]
        public async Task<ActionResult<Product>> UpdateQuantity(int id, [FromBody] int newQuantity)
        {
            var updatedProduct = await _productService.UpdateProductQuantityAsync(id, newQuantity);
            if (updatedProduct == null)
                return NotFound(new { message = "Product not found." });

            return Ok(updatedProduct);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var success = await _productService.DeleteProductAsync(id);
            if (!success) return NotFound();

            return Ok(new { message = "Product deleted successfully." });
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Product>>> SearchAndSortProducts(
            [FromQuery] string? search,
            [FromQuery] string? sortBy,
            [FromQuery] string? sortOrder)
        {
            var results = await _productService.SearchAndSortProductsAsync(search, sortBy, sortOrder);
            return Ok(results);
        }

        [Authorize(Roles = "ProductManager")]
        [HttpPost("categories")]
        public async Task<ActionResult<Category>> AddCategory([FromBody] string categoryName)
        {
            var added = await _productService.AddCategoryAsync(categoryName);
            if (added == null)
                return BadRequest(new { message = "Category name is required." });

            return CreatedAtAction(nameof(GetCategoryById), new { id = added.Id }, added);
        }

        [Authorize(Roles = "ProductManager")]
        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var success = await _productService.DeleteCategoryAsync(id);
            if (!success)
                return NotFound(new { message = "Category not found." });

            return Ok(new { message = "Category deleted successfully." });
        }

        [HttpGet("categories/{id}")]
        public async Task<ActionResult<Category>> GetCategoryById(int id)
        {
            var category = await _productService.GetCategoryByIdAsync(id); 
            if (category == null)
                return NotFound();

            return Ok(category);
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<Category>>> GetAllCategories()
        {
            var categories = await _productService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpPut("setprice")]
        [Authorize(Roles = "SalesManager")]
        public async Task<IActionResult> SetPrice([FromBody] PriceUpdateDTO dto){


            try
            {
                await _productService.SetPriceAsync(dto.ProductId, dto.NewPrice);

                return NoContent();

            }

            catch (KeyNotFoundException){


                return NotFound();
            }

            catch (ArgumentException ex){
                return BadRequest(new { message = ex.Message });
            }
            return Ok(new {messsage = "price set successfully"});
        }

        [Authorize(Roles = "SalesManager")]
        [HttpPut("{id}/updateprice")]
        public async Task<ActionResult<Product>> UpdatePrice(int id, [FromBody] double newPrice)
        {
            if (newPrice < 0)
                return BadRequest("Price cannot be negative");

            var updated = await _productService.UpdateProductPriceAsync(id, newPrice);
            if (updated == null) 
                return NotFound(new { message = "Product not found" });

            return Ok(updated);
        }

        [Authorize(Roles = "SalesManager")]
        [HttpPost("discount")]
        public async Task<IActionResult> ApplyDiscount([FromBody] DiscountRequestDto dto)
        {
            if (dto == null || dto.ProductIds == null || dto.ProductIds.Count == 0)
                return BadRequest(new { message = "Product IDs are required." });

            if (dto.DiscountPercentage <= 0 || dto.DiscountPercentage >= 100)
                return BadRequest(new { message = "Discount must be between 0 and 100." });

            try
            {
                await _productService.ApplyDiscountAsync(dto.ProductIds, dto.DiscountPercentage);
                return Ok(new { message = "Discount applied and notifications sent." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error applying discount.", error = ex.Message });
            }
        }





        // =========================
        // COMMENT METHODS
        // =========================

        [HttpGet("{id}/comments")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetCommentsByProductId(int id)
        {
            var comments = await _productService.GetCommentsByProductIdAsync(id);
            return Ok(comments);
        }

        [Authorize(Roles = "ProductManager")]
        [HttpGet("comments")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetAllComments()
        {
            var comments = await _productService.GetAllCommentsAsync();
            return Ok(comments);
        }

        [Authorize]
        [HttpPost("{id}/comments")]
        public async Task<ActionResult<Comment>> AddComment(int id, [FromBody] CommentCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var newComment = await _productService.AddCommentAsync(id, userId, dto.ProductComment);

            if (newComment == null)
                return BadRequest(new { message = "The product is not delivered or already has a comment by the user" });

            return CreatedAtAction(nameof(GetCommentsByProductId), new { id }, newComment);
        }

        [Authorize(Roles = "ProductManager")]
        [HttpPut("comments/{commentId}/approve")]
        public async Task<ActionResult<Comment>> ApproveComment(int commentId)
        {
            var comment = await _productService.GetCommentByIdAsync(commentId);
            if (comment == null)
                return NotFound(new { message = "Comment not found." });

            comment.Status = (int)CommentStatus.Approved;
            var approvedComment = await _productService.UpdateCommentAsync(comment);
            return Ok(approvedComment);
        }

        [Authorize(Roles = "ProductManager")]
        [HttpPut("comments/{commentId}/disapprove")]
        public async Task<ActionResult<Comment>> DisapproveComment(int commentId)
        {
            var comment = await _productService.GetCommentByIdAsync(commentId);
            if (comment == null)
                return NotFound(new { message = "Comment not found." });

            comment.Status = (int)CommentStatus.Disapproved;
            var approvedComment = await _productService.UpdateCommentAsync(comment);
            return Ok(approvedComment);
        }


        // =========================
        // RATING METHODS
        // =========================

        [HttpGet("{id}/ratings")]
        public async Task<ActionResult<IEnumerable<Rating>>> GetRatingsByProductId(int id)
        {
            var ratings = await _productService.GetRatingsByProductIdAsync(id);
            return Ok(ratings);
        }

        [Authorize]
        [HttpPost("{id}/ratings")]
        public async Task<ActionResult<Rating>> AddRating(int id, [FromBody] RatingCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var newRating = await _productService.AddRatingAsync(id, userId, dto.ProductRating);

            if (newRating == null)
                return BadRequest(new { message = "The product is not delivered or already has a comment by the user" });

            return CreatedAtAction(nameof(GetRatingsByProductId), new { id }, newRating);
        }

        // ==========================
        // Wishlist Methods
        // ==========================
        [Authorize]
        [HttpPost("{id}/wishlist")]
        public async Task<ActionResult<Wishlist>> AddToWishlist(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var wishlistItem = await _productService.AddToWishlistAsync(id, userId);

            if (wishlistItem == null)
                return BadRequest(new { message = "The product is already in the wishlist." });

            return CreatedAtAction(nameof(GetWishlistByUserId), new { id }, wishlistItem);
        }

        [Authorize]
        [HttpGet("wishlist")]
        public async Task<ActionResult<IEnumerable<Wishlist>>> GetWishlistByUserId()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var wishlistItems = await _productService.GetWishlistByUserIdAsync(userId);
            return Ok(wishlistItems);
        }

        [Authorize]
        [HttpDelete("wishlist/{wishId}")]
        public async Task<IActionResult> RemoveFromWishlist(int wishId)
        {
            var success = await _productService.RemoveFromWishlistAsync(wishId);
            if (!success)
                return NotFound(new { message = "Wishlist item not found." });

            return Ok(new { message = "Wishlist item removed successfully." });
        }
    }
}
