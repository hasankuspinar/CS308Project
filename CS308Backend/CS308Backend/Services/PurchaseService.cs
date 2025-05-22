using CS308Backend.Models;
using CS308Backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CS308Backend.Services
{
    public interface IPurchaseService
    {
        Task<Guid> MakePurchaseAsync(int userId, int productId, int quantity);
        Task<Delivery> UpdateDeliveryStatusAsync(int id, int status);
        Task<IEnumerable<Object>> GetAllPurchasesAsync();
        Task<IEnumerable<Object>> GetPurchasesByUserIdAsync(int userId);
        Task<Guid> ProcessCheckoutAsync(int userId, List<CheckoutItemDto> items, string deliveryAddress, string firstName, string lastName);
        Task<byte[]> GenerateInvoiceByOrderIdAsync(Guid orderId, int userId, string firstName, string lastName);
        Task<IEnumerable<Guid>> GetOrdersByUserIdAsync(int userId);
        Task<IEnumerable<Guid>> GetAllOrdersAsync();
        Task<IEnumerable<PurchaseDetailsDto>> GetPurchasesByOrderIdAsync(Guid orderId);
        Task<IEnumerable<Delivery>> UpdateDeliveryStatusByOrderIdAsync(Guid orderId, int status);
        Task<bool> CancelOrderAsync(Guid orderId);
        Task<bool> RefundOrderAsync(Guid orderId);
        Task<bool> ApproveRefundAsync(Guid orderId);
        Task<IEnumerable<PurchaseDetailsDto>> GetPurchasesByDateRangeAsync(DateTime start, DateTime end);
        Task<RevenueReportDto> GetRevenueReportAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Guid>> GetRefundRequestedOrderIdsAsync();
    }
    public class PurchaseService: IPurchaseService
    {
        private readonly IProductRepository _productRepository;
        private readonly ICommentRepository _commentRepository;
        private readonly IRatingRepository _ratingRepository;
        private readonly IPurchaseRepository _purchaseRepository;
        private readonly IDeliveryRepository _deliveryRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly IInvoiceService _invoiceService;
        private readonly ICartItemRepository _cartRepository;
        public PurchaseService(IProductRepository productRepository, ICommentRepository commentRepository, IRatingRepository ratingRepository, IPurchaseRepository purchaseRepository, IDeliveryRepository deliveryRepository, IUserRepository userRepository, IEmailService emailService, IInvoiceService invoiceService, ICartItemRepository cartRepository)
        {
            _productRepository = productRepository;
            _commentRepository = commentRepository;
            _ratingRepository = ratingRepository;
            _purchaseRepository = purchaseRepository;
            _deliveryRepository = deliveryRepository;
            _userRepository = userRepository;
            _emailService = emailService;
            _invoiceService = invoiceService;
            _cartRepository = cartRepository;
        }

        public async Task<Guid> MakePurchaseAsync(int userId, int productId, int quantity)
        {
            var product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null || product.Quantity < quantity)
                return Guid.Empty;

            product.Quantity -= quantity;
            await _productRepository.UpdateProductAsync(product);

            var purchase = new Purchase
            {
                UserId = userId,
                ProductId = productId,
                Quantity = quantity,
                Date = DateTime.UtcNow
            };

            var savedPurchase = await _purchaseRepository.AddPurchaseAsync(purchase);

            var orderId = Guid.NewGuid();

            var delivery = new Delivery
            {
                PurchaseID = savedPurchase.Id,
                CustomerID = userId,
                ProductID = productId,
                Quantity = quantity,
                TotalPrice = product.Price * quantity,
                DeliveryAddress = "Default Address",
                Status = DeliveryStatus.Processing,
                OrderId = orderId
            };

            await _deliveryRepository.AddDeliveryAsync(delivery);

            var user = await _userRepository.GetUserById(userId);
            var products = (await _productRepository.GetAllProductsAsync()).ToList();

            return orderId;
        }


        public async Task<Delivery> UpdateDeliveryStatusAsync(int id, int status)
        {
            var delivery = await _deliveryRepository.GetDeliveryByIdAsync(id);
            if (delivery == null)
                return null;

            delivery.Status = (DeliveryStatus)status;
            return await _deliveryRepository.UpdateDeliveryStatusAsync(delivery);
        }
        public async Task<IEnumerable<object>> GetAllPurchasesAsync()
        {
            var purchases = await _purchaseRepository.GetAllPurchasesAsync();
            var deliveries = await _deliveryRepository.GetAllDeliveriesAsync();

            var result = purchases.Select(p =>
            {
                var delivery = deliveries.FirstOrDefault(d => d.PurchaseID == p.Id);

                return new
                {
                    PurchaseId = p.Id,
                    ProductId = p.ProductId,
                    UserId = p.UserId,
                    Quantity = p.Quantity,
                    Date = p.Date,
                    DeliveryID = delivery.DeliveryID,
                    DeliveryAddress = delivery.DeliveryAddress,
                    TotalPrice = delivery.TotalPrice,
                    Status = delivery.Status.ToString(),
                };
            });

            return result;
        }

        public async Task<IEnumerable<object>> GetPurchasesByUserIdAsync(int userId)
        {
            var purchases = await _purchaseRepository.GetPurchasesByUserIdAsync(userId);
            var deliveries = await _deliveryRepository.GetDeliveriesByUserIdAsync(userId);

            var result = purchases.Select(p =>
            {
                var delivery = deliveries.FirstOrDefault(d => d.PurchaseID == p.Id);

                return new
                {
                    PurchaseId = p.Id,
                    ProductId = p.ProductId,
                    Quantity = p.Quantity,
                    Date = p.Date,
                    DeliveryID = delivery.DeliveryID,
                    DeliveryAddress = delivery.DeliveryAddress,
                    TotalPrice = delivery.TotalPrice,
                    Status = delivery.Status.ToString(),
                };
            });

            return result;
        }

        public async Task<Guid> ProcessCheckoutAsync(int userId, List<CheckoutItemDto> items, string deliveryAddress, string firstName, string lastName)
        {
            foreach (var item in items)
            {
                var product = await _productRepository.GetProductByIdAsync(item.ProductId);
                if (product == null || product.Quantity < item.Quantity)
                {
                    return Guid.Empty;
                }
            }

            var orderId = Guid.NewGuid();
            var successfulPurchases = new List<Purchase>();

            foreach (var item in items)
            {
                var product = await _productRepository.GetProductByIdAsync(item.ProductId);

                product.Quantity -= item.Quantity;
                await _productRepository.UpdateProductAsync(product);

                var purchase = new Purchase
                {
                    UserId = userId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Date = DateTime.UtcNow
                };

                var savedPurchase = await _purchaseRepository.AddPurchaseAsync(purchase);
                successfulPurchases.Add(savedPurchase);

                var delivery = new Delivery
                {
                    PurchaseID = savedPurchase.Id,
                    CustomerID = userId,
                    ProductID = item.ProductId,
                    Quantity = item.Quantity,
                    TotalPrice = product.Price * item.Quantity,
                    DeliveryAddress = deliveryAddress,
                    Status = DeliveryStatus.Processing,
                    OrderId = orderId
                };

                await _deliveryRepository.AddDeliveryAsync(delivery);
            }

            var user = await _userRepository.GetUserById(userId);
            var deliveries = (await _deliveryRepository.GetDeliveriesByUserIdAsync(userId))
                .Where(d => d.OrderId == orderId).ToList();
            var products = (await _productRepository.GetAllProductsAsync()).ToList();

            var invoiceBytes = _invoiceService.GenerateInvoicePdf(successfulPurchases, deliveries, products, user, firstName, lastName);
            await _emailService.SendInvoiceEmailAsync(user.Email, invoiceBytes);

            await _cartRepository.ClearCartAsync(userId, null);

            return orderId;
        }

        public async Task<byte[]> GenerateInvoiceByOrderIdAsync(Guid orderId, int userId, string firstName, string lastName)
        {
            var deliveries = (await _deliveryRepository.GetAllDeliveriesAsync())
                .Where(d => d.OrderId == orderId)
                .ToList();

            var purchaseIds = deliveries.Select(d => d.PurchaseID).ToList();
            var purchases = await _purchaseRepository.GetPurchasesByIdsAsync(purchaseIds);
            var products = await _productRepository.GetAllProductsAsync();
            var user = await _userRepository.GetUserById(userId);

            return _invoiceService.GenerateInvoicePdf(purchases.ToList(), deliveries, products.ToList(), user, firstName, lastName);
        }


        public async Task<IEnumerable<Guid>> GetOrdersByUserIdAsync(int userId)
        {
            var deliveries = await _deliveryRepository.GetDeliveriesByUserIdAsync(userId);
            return deliveries
                .Where(d => d.OrderId != Guid.Empty)
                .Select(d => d.OrderId)
                .Distinct()
                .ToList();
        }

        public async Task<IEnumerable<Guid>> GetAllOrdersAsync()
        {
            var deliveries = await _deliveryRepository.GetAllDeliveriesAsync();
            return deliveries
                .Where(d => d.OrderId != Guid.Empty)
                .Select(d => d.OrderId)
                .Distinct()
                .ToList();
        }

        public async Task<IEnumerable<PurchaseDetailsDto>> GetPurchasesByOrderIdAsync(Guid orderId)
        {
            var deliveries = (await _deliveryRepository.GetAllDeliveriesAsync())
                .Where(d => d.OrderId == orderId)
                .ToList();

            var purchaseIds = deliveries.Select(d => d.PurchaseID).ToList();
            var purchases = await _purchaseRepository.GetPurchasesByIdsAsync(purchaseIds);
            var products = await _productRepository.GetAllProductsAsync();

            var result = purchases.Select(p =>
            {
                var delivery = deliveries.FirstOrDefault(d => d.PurchaseID == p.Id);
                var product = products.FirstOrDefault(pr => pr.Id == p.ProductId);

                return new PurchaseDetailsDto
                {
                    PurchaseId = p.Id,
                    ProductId = p.ProductId,
                    UserId = p.UserId,
                    ProductName = product?.ProductName ?? "Unknown",
                    Quantity = p.Quantity,
                    Date = p.Date,
                    DeliveryAddress = delivery?.DeliveryAddress,
                    TotalPrice = delivery?.TotalPrice,
                    Status = delivery?.Status.ToString(),
                    OrderId = delivery?.OrderId
                };
            });

            return result;
        }

        public async Task<IEnumerable<PurchaseDetailsDto>> GetPurchasesByDateRangeAsync(DateTime start, DateTime end)
        {
            var purchases = (await _purchaseRepository.GetAllPurchasesAsync())
                .Where(p => p.Date.Date >= start.Date && p.Date.Date <= end.Date)
                .ToList();

            var deliveries = await _deliveryRepository.GetAllDeliveriesAsync();
            var products = await _productRepository.GetAllProductsAsync();

            var result = purchases.Select(p =>
            {
                var delivery = deliveries.FirstOrDefault(d => d.PurchaseID == p.Id);
                var product = products.FirstOrDefault(pr => pr.Id == p.ProductId);

                return new PurchaseDetailsDto
                {
                    PurchaseId = p.Id,
                    ProductId = p.ProductId,
                    UserId = p.UserId,
                    ProductName = product?.ProductName ?? "Unknown",
                    Quantity = p.Quantity,
                    Date = p.Date,
                    DeliveryAddress = delivery?.DeliveryAddress,
                    TotalPrice = delivery?.TotalPrice,
                    Status = delivery?.Status.ToString(),
                    OrderId = delivery?.OrderId
                };
            });

            return result;
        }

        public async Task<IEnumerable<Delivery>> UpdateDeliveryStatusByOrderIdAsync(Guid orderId, int status)
        {
            var deliveries = (await _deliveryRepository.GetAllDeliveriesAsync())
                .Where(d => d.OrderId == orderId)
                .ToList();

            foreach (var delivery in deliveries)
            {
                delivery.Status = (DeliveryStatus)status;
                await _deliveryRepository.UpdateDeliveryStatusAsync(delivery);
            }

            return deliveries;
        }

        public async Task<bool> CancelOrderAsync(Guid orderId)
        {
            var deliveries = (await _deliveryRepository.GetAllDeliveriesAsync())
                .Where(d => d.OrderId == orderId && d.Status == DeliveryStatus.Processing)
                .ToList();

            if (!deliveries.Any())
                return false;

            foreach (var delivery in deliveries)
            {
                delivery.Status = DeliveryStatus.Cancelled;
                await _deliveryRepository.UpdateDeliveryStatusAsync(delivery);
            }

            var purchases = await this.GetPurchasesByOrderIdAsync(orderId);
            foreach (var purchase in purchases)
            {
                var product = await _productRepository.GetProductByIdAsync(purchase.ProductId);
                if (product != null)
                {
                    product.Quantity += purchase.Quantity;
                    await _productRepository.UpdateProductAsync(product);
                }
            }

            return true;
        }

        public async Task<bool> RefundOrderAsync(Guid orderId)
        {
            var deliveries = (await _deliveryRepository.GetAllDeliveriesAsync())
                .Where(d => d.OrderId == orderId && d.Status == DeliveryStatus.Delivered)
                .ToList();

            if (!deliveries.Any())
                return false;

            var purchaseIds = deliveries.Select(d => d.PurchaseID).ToList();
            var purchases = await _purchaseRepository.GetPurchasesByIdsAsync(purchaseIds);

            var withinRefundPeriod = purchases.All(p => (DateTime.UtcNow - p.Date).TotalDays <= 30);
            if (!withinRefundPeriod)
                return false;

            foreach (var delivery in deliveries)
            {
                delivery.Status = DeliveryStatus.RefundRequested;
                await _deliveryRepository.UpdateDeliveryStatusAsync(delivery);
            }

            return true;
        }

        public async Task<bool> ApproveRefundAsync(Guid orderId)
        {
            var deliveries = (await _deliveryRepository.GetAllDeliveriesAsync())
                .Where(d => d.OrderId == orderId && d.Status == DeliveryStatus.RefundRequested)
                .ToList();

            if (!deliveries.Any())
                return false;

            foreach (var delivery in deliveries)
            {
                delivery.Status = DeliveryStatus.Refunded;
                await _deliveryRepository.UpdateDeliveryStatusAsync(delivery);

                var product = await _productRepository.GetProductByIdAsync(delivery.ProductID);
                if (product != null)
                {
                    product.Quantity += delivery.Quantity;
                    await _productRepository.UpdateProductAsync(product);
                }

                var user = await _userRepository.GetUserById(delivery.CustomerID);
                if (user != null && !string.IsNullOrWhiteSpace(user.Email))
                {
                    var subject = "Your refund has been approved";
                    var body = $"Hello {user.Name},\n\nYour refund for order ID {orderId} has been approved. The amount ${delivery.TotalPrice:F2} will be refunded to you shortly.\n\nBest regards,\nCHANTA Team";
                    await _emailService.SendEmailAsync(user.Email, subject, body);
                }
            }

            return true;
        }

        public async Task<RevenueReportDto> GetRevenueReportAsync(DateTime startDate, DateTime endDate)
        {
            var deliveries = (await _deliveryRepository.GetAllDeliveriesAsync())
                .Where(d => d.Status != DeliveryStatus.Cancelled && d.Status != DeliveryStatus.Refunded)
                .ToList();

            var purchases = (await _purchaseRepository.GetAllPurchasesAsync())
                .Where(p => p.Date.Date >= startDate.Date && p.Date.Date <= endDate.Date &&
                    deliveries.Any(d => d.PurchaseID == p.Id))
                .ToList();

            var products = await _productRepository.GetAllProductsAsync();

            double totalRevenue = 0;
            double totalCost = 0;

            foreach (var purchase in purchases)
            {
                var product = products.FirstOrDefault(p => p.Id == purchase.ProductId);
                var delivery = deliveries.FirstOrDefault(d => d.PurchaseID == purchase.Id);

                if (product != null && delivery != null)
                {
                    double revenue = delivery.TotalPrice;
                    double cost = product.OldPrice * 0.5 * delivery.Quantity; // 50% cost assumption
                    totalRevenue += revenue;
                    totalCost += cost;
                }
            }

            return new RevenueReportDto
            {
                StartDate = startDate,
                EndDate = endDate,
                TotalRevenue = totalRevenue,
                TotalCost = totalCost,
                Profit = totalRevenue - totalCost
            };
        }

        public async Task<IEnumerable<Guid>> GetRefundRequestedOrderIdsAsync()
        {
            var deliveries = await _deliveryRepository.GetAllDeliveriesAsync();
            return deliveries
                .Where(d => d.Status == DeliveryStatus.RefundRequested && d.OrderId != Guid.Empty)
                .Select(d => d.OrderId)
                .Distinct()
                .ToList();
        }

    }
}
