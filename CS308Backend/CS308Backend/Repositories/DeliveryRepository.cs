using CS308Backend.Data;
using CS308Backend.Models;
using Microsoft.EntityFrameworkCore;
namespace CS308Backend.Repositories
{
    public class DeliveryRepository : IDeliveryRepository
    {
        private readonly AppDbContext _context;

        public DeliveryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Delivery>> GetAllDeliveriesAsync()
        {
            return await _context.Delivery.ToListAsync();
        }

        public async Task<IEnumerable<Delivery>> GetDeliveriesByUserIdAsync(int id)
        {
            return await _context.Delivery
                .Where(d => d.CustomerID == id)
                .ToListAsync();
        }

        public async Task<Delivery> GetDeliveryByIdAsync(int id)
        {
            return await _context.Delivery.FirstOrDefaultAsync(d => d.DeliveryID == id);
        }

        public async Task<Delivery> AddDeliveryAsync(Delivery delivery)
        {
            _context.Delivery.Add(delivery);
            await _context.SaveChangesAsync();
            return delivery;
        }

        public async Task<Delivery> UpdateDeliveryStatusAsync(Delivery delivery)
        {
            var existingDelivery = await _context.Delivery.FindAsync(delivery.DeliveryID);
            if (existingDelivery != null)
            {
                existingDelivery.Status = delivery.Status;
                await _context.SaveChangesAsync();
            }
            return existingDelivery;
        }
    }
}
