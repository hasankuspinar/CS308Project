using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CS308Backend.Data;
using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public class RatingRepository : IRatingRepository
    {
        private readonly AppDbContext _context;

        public RatingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Rating>> GetAllRatingsAsync()
        {
            return await _context.Rating.ToListAsync();
        }

        public async Task<IEnumerable<Rating>> GetRatingsByProductIdAsync(int id)
        {
            return await _context.Rating
                                 .Where(r => r.ProductId == id)
                                 .ToListAsync();
        }

        public async Task<Rating> AddRatingAsync(Rating rating)
        {
            _context.Rating.Add(rating);
            await _context.SaveChangesAsync();
            return rating;
        }
    }
}
