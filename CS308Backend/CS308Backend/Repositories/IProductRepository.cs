using System.Collections.Generic;
using System.Threading.Tasks;
using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllProductsAsync();
        Task<Product> GetProductByIdAsync(int id);
        Task<Product> AddProductAsync(Product product);
        Task<Product> UpdateProductAsync(Product product);
        Task<bool> DeleteProductAsync(int id);
        Task<IEnumerable<Product>> SearchAndSortProductsAsync(string? search, string? sortBy, string? sortOrder);
        Task<IEnumerable<Product>> GetAllProductsWithZeroPriceAsync();
    }
}
