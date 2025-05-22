using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public interface ICartItemRepository
    {
        Task<List<CartItem>> GetCartItemsAsync(int? userId, Guid? guestCartId);
        Task<CartItem> GetCartItemAsync(int? userId, Guid? guestCartId, int productId);
        Task AddCartItemAsync(CartItem item);
        Task UpdateCartItemAsync(CartItem item);
        Task DeleteCartItemAsync(int? userId, Guid? guestCartId, int productId);
        Task ClearCartAsync(int? userId, Guid? guestCartId);
        Task MergeGuestCartIntoUserAsync(Guid guestCartId, int userId);
    }
}
