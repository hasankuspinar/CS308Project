using CS308Backend.Models;
using CS308Backend.Repositories;

namespace CS308Backend.Services
{
    public interface IShoppingCartService
    {
        Task<List<CartItem>> GetCartAsync(int? userId, Guid? guestCartId);
        Task AddOrUpdateCartItemAsync(int? userId, Guid? guestCartId, CartItemDTO dto, bool isUpdate);
        Task RemoveCartItemAsync(int? userId, Guid? guestCartId, int productId);
        Task ClearCartAsync(int? userId, Guid? guestCartId);
        Task MergeGuestCartIntoUserAsync(Guid guestCartId, int userId);
    }
    public class ShoppingCartService : IShoppingCartService
    {
        private readonly ICartItemRepository _cartRepo;

        public ShoppingCartService(ICartItemRepository cartRepo)
        {
            _cartRepo = cartRepo;
        }

        public async Task<List<CartItem>> GetCartAsync(int? userId, Guid? guestCartId)
        {
            return await _cartRepo.GetCartItemsAsync(userId, guestCartId);
        }

        public async Task AddOrUpdateCartItemAsync(int? userId, Guid? guestCartId, CartItemDTO dto, bool isUpdate = false)
        {
            var existing = await _cartRepo.GetCartItemAsync(userId, guestCartId, dto.ProductId);
            if (existing != null)
            {
                if (isUpdate)
                {
                    existing.Quantity = dto.Quantity;
                }
                else
                {
                    existing.Quantity += dto.Quantity;
                }
                await _cartRepo.UpdateCartItemAsync(existing);
            }
            else
            {
                var item = new CartItem
                {
                    UserId = userId,
                    GuestCartId = guestCartId,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity
                };
                await _cartRepo.AddCartItemAsync(item);
            }
        }


        public async Task RemoveCartItemAsync(int? userId, Guid? guestCartId, int productId)
        {
            await _cartRepo.DeleteCartItemAsync(userId, guestCartId, productId);
        }

        public async Task ClearCartAsync(int? userId, Guid? guestCartId)
        {
            await _cartRepo.ClearCartAsync(userId, guestCartId);
        }

        public async Task MergeGuestCartIntoUserAsync(Guid guestCartId, int userId)
        {
            await _cartRepo.MergeGuestCartIntoUserAsync(guestCartId, userId);
        }
    }
}
