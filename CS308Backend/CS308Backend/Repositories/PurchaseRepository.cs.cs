using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CS308Backend.Data;
using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public class PurchaseRepository : IPurchaseRepository
    {
        private readonly AppDbContext _context;

        public PurchaseRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Purchase>> GetPurchasesByIdsAsync(List<int> ids)
        {
            return await _context.Purchase.Where(p => ids.Contains(p.Id)).ToListAsync();
        }

        public async Task<IEnumerable<Purchase>> GetAllPurchasesAsync()
        {
            return await _context.Purchase
                                 .OrderByDescending(p => p.Date) 
                                 .ToListAsync();
        }

        public async Task<IEnumerable<Purchase>> GetPurchasesByUserIdAsync(int userId)
        {
            return await _context.Purchase
                                 .Where(p => p.UserId == userId)
                                 .OrderByDescending(p => p.Date) 
                                 .ToListAsync();
        }

        public async Task<Purchase> AddPurchaseAsync(Purchase purchase)
        {
            purchase.Date = DateTime.UtcNow; 
            _context.Purchase.Add(purchase);
            await _context.SaveChangesAsync();
            return purchase;
        }
    }
}
