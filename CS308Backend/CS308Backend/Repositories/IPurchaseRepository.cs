using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public interface IPurchaseRepository
    {
        Task<IEnumerable<Purchase>> GetAllPurchasesAsync();

        Task<IEnumerable<Purchase>> GetPurchasesByUserIdAsync(int userId);

        Task<Purchase> AddPurchaseAsync(Purchase purchase);

        Task<IEnumerable<Purchase>> GetPurchasesByIdsAsync(List<int> ids);
    }
}
