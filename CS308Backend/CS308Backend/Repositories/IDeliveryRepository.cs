using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public interface IDeliveryRepository
    {
        Task<IEnumerable<Delivery>> GetAllDeliveriesAsync();

        Task<IEnumerable<Delivery>> GetDeliveriesByUserIdAsync(int id);
        Task<Delivery> GetDeliveryByIdAsync(int id);

        Task<Delivery> AddDeliveryAsync(Delivery delivery);

        Task<Delivery> UpdateDeliveryStatusAsync(Delivery delivery);
    }
}
