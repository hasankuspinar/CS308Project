using CS308Backend.Data;
using CS308Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace CS308Backend.Repositories
{
    public class CartItemRepository : ICartItemRepository
    {
        private readonly AppDbContext _context;

        public CartItemRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CartItem>> GetCartItemsAsync(int? userId, Guid? guestCartId)
        {
            return await _context.CartItem
                .Where(ci => (userId.HasValue && ci.UserId == userId) || (guestCartId.HasValue && ci.GuestCartId == guestCartId))
                .ToListAsync();
        }

        public async Task<CartItem> GetCartItemAsync(int? userId, Guid? guestCartId, int productId)
        {
            return await _context.CartItem.FirstOrDefaultAsync(ci =>
                ((userId.HasValue && ci.UserId == userId) || (guestCartId.HasValue && ci.GuestCartId == guestCartId))
                && ci.ProductId == productId);
        }

        public async Task AddCartItemAsync(CartItem item)
        {
            _context.CartItem.Add(item);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCartItemAsync(CartItem item)
        {
            _context.CartItem.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCartItemAsync(int? userId, Guid? guestCartId, int productId)
        {
            var item = await GetCartItemAsync(userId, guestCartId, productId);
            if (item != null)
            {
                _context.CartItem.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ClearCartAsync(int? userId, Guid? guestCartId)
        {
            var items = _context.CartItem.Where(ci =>
                (userId.HasValue && ci.UserId == userId) ||
                (guestCartId.HasValue && ci.GuestCartId == guestCartId));

            _context.CartItem.RemoveRange(items);
            await _context.SaveChangesAsync();
        }

        public async Task MergeGuestCartIntoUserAsync(Guid guestCartId, int userId)
        {
            var guestItems = await _context.CartItem
                .Where(ci => ci.GuestCartId == guestCartId)
                .ToListAsync();

            foreach (var item in guestItems)
            {
                item.UserId = userId;
                item.GuestCartId = null;
            }

            await _context.SaveChangesAsync();
        }
    }
}
