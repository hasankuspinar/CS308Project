using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CS308Backend.Data;
using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;

        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            return await _context.Product.Where(p => p.Price != 0.0).ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetAllProductsWithZeroPriceAsync()
        {
            return await _context.Product.Where(p => p.Price == 0.0).ToListAsync();
        }

        public async Task<Product> GetProductByIdAsync(int id)
        {
            return await _context.Product.FindAsync(id);
        }

        public async Task<Product> AddProductAsync(Product product)
        {
            _context.Product.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product> UpdateProductAsync(Product product)
        {
            _context.Product.Update(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Product.FindAsync(id);
            if (product == null)
                return false;

            _context.Product.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Product>> SearchAndSortProductsAsync(string? search, string? sortBy, string? sortOrder)
        {
            var query = _context.Product.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p =>
                    p.ProductName.Contains(search) ||
                    p.Description.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(sortBy))
            {
                bool isDescending = sortOrder?.ToLower() == "desc";

                switch (sortBy.ToLower())
                {
                    case "price":
                        query = isDescending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price);
                        break;

                    case "popularity":
                        query = isDescending
                            ? query.OrderByDescending(p =>
                                _context.Rating.Where(r => r.ProductId == p.Id).Average(r => (double?)r.ProductRating) ?? 0)
                            : query.OrderBy(p =>
                                _context.Rating.Where(r => r.ProductId == p.Id).Average(r => (double?)r.ProductRating) ?? 0);
                        break;
                }
            }

            return await query.ToListAsync();
        }

    }
}
