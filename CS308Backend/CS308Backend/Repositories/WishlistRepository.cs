using CS308Backend.Data;
using CS308Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace CS308Backend.Repositories
{
    public class WishlistRepository : IWishlistRepository
    {
        private readonly AppDbContext _context;

        public WishlistRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Wishlist> AddToWishlist(Wishlist wishlist)
        {
            await _context.Wishlist.AddAsync(wishlist);
            await _context.SaveChangesAsync();
            return wishlist;
        }

        public async Task<List<Wishlist>> GetWishlistByUserId(int userId)
        {
            return await _context.Wishlist.Where(w => w.UserId == userId).ToListAsync();
        }

        public async Task<bool> RemoveFromWishlist(int wishId)
        {
            var wishlist = await _context.Wishlist.FindAsync(wishId);
            if (wishlist != null)
            {
                _context.Wishlist.Remove(wishlist);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<List<Wishlist>> GetWishlistByProductIdAsync(int productId)
        {
            return await _context.Wishlist
                                .Where(w => w.ProductId == productId)
                                .ToListAsync();
        }
    }
}
