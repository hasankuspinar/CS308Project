using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public interface IWishlistRepository
    {
        Task<Wishlist> AddToWishlist(Wishlist wishlist);
        Task<List<Wishlist>> GetWishlistByUserId(int userId);
        Task<bool> RemoveFromWishlist(int wishId);
        Task<List<Wishlist>> GetWishlistByProductIdAsync(int productId);
    }
}
