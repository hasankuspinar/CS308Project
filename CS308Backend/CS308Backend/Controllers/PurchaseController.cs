using CS308Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CS308Backend.Services;
using System.Security.Claims;

namespace CS308Backend.Controllers
{
    [ApiController]
    [Route("/purchases")]
    public class PurchaseController : ControllerBase
    {
        private readonly IPurchaseService _purchaseService;

        public PurchaseController(IPurchaseService purchaseService, IInvoiceService invoiceService)
        {
            _purchaseService = purchaseService;
        }

        [Authorize]
        [HttpPost("products/{productId}/purchase")]
        public async Task<ActionResult<Guid>> MakePurchase(int productId, [FromBody] PurchaseCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var orderId = await _purchaseService.MakePurchaseAsync(userId, productId, dto.Quantity);
            if (orderId == Guid.Empty)
                return BadRequest(new { message = "Purchase failed. Not enough stock or product does not exist." });

            return Ok(orderId);
        }

        [Authorize]
        [HttpPost("checkout")]
        public async Task<ActionResult<Guid>> Checkout([FromBody] CheckoutRequestDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var orderId = await _purchaseService.ProcessCheckoutAsync(userId, dto.Items, dto.DeliveryAddress, dto.FirstName, dto.LastName);

            if (orderId == Guid.Empty)
                return BadRequest(new { message = "Checkout failed. One or more products exceed available stock." });

            return Ok(orderId);
        }

        [Authorize(Roles = "ProductManager")]
        [HttpPut("orders/{orderId}/status/{status}")]
        public async Task<ActionResult<IEnumerable<Delivery>>> UpdateDeliveryStatusByOrder(Guid orderId, int status)
        {
            var updatedDeliveries = await _purchaseService.UpdateDeliveryStatusByOrderIdAsync(orderId, status);

            if (!updatedDeliveries.Any())
                return NotFound(new { message = "No deliveries found for this order." });

            return Ok(updatedDeliveries);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAllPurchases()
        {
            var purchases = await _purchaseService.GetAllPurchasesAsync();
            return Ok(purchases);
        }

        [Authorize]
        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserPurchases()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var purchases = await _purchaseService.GetPurchasesByUserIdAsync(userId);
            return Ok(purchases);
        }

        [Authorize]
        [HttpPost("invoice/by-order")]
        public async Task<IActionResult> GetInvoiceByOrder([FromBody] InvoiceRequestDto dto)
        {
            var pdf = await _purchaseService.GenerateInvoiceByOrderIdAsync(dto.OrderId, dto.UserId, dto.FirstName, dto.LastName);
            return File(pdf, "application/pdf", "invoice.pdf");
        }

        [Authorize]
        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<Guid>>> GetUserOrders()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var orders = await _purchaseService.GetOrdersByUserIdAsync(userId);
            return Ok(orders);
        }

        [Authorize(Roles = "ProductManager")]
        [HttpGet("orders/all")]
        public async Task<ActionResult<IEnumerable<Guid>>> GetAllOrders()
        {
            var orders = await _purchaseService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [Authorize]
        [HttpGet("orders/{orderId}")]
        public async Task<ActionResult<IEnumerable<PurchaseDetailsDto>>> GetPurchasesByOrder(Guid orderId)
        {
            var result = await _purchaseService.GetPurchasesByOrderIdAsync(orderId);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("cancel/{orderId}")]
        public async Task<IActionResult> CancelOrder(Guid orderId)
        {
            var result = await _purchaseService.CancelOrderAsync(orderId);

            if (result)
                return Ok(new { message = "Order cancelled successfully." });

            return NotFound(new { message = "Order not found or could not be cancelled." });
        }

        [Authorize(Roles = "SalesManager")]
        [HttpGet("invoices")]
        public async Task<ActionResult<IEnumerable<PurchaseDetailsDto>>> GetInvoicesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var results = await _purchaseService.GetPurchasesByDateRangeAsync(startDate, endDate);
            return Ok(results);
        }

        [Authorize]
        [HttpPut("refund/{orderId}")]
        public async Task<IActionResult> RequestRefund(Guid orderId)
        {
            var result = await _purchaseService.RefundOrderAsync(orderId);

            if (result)
                return Ok(new { message = "Refund request submitted successfully." });

            return BadRequest(new { message = "Refund request failed. Order must be delivered and within 30 days." });
        }

        [Authorize(Roles = "SalesManager")]
        [HttpPut("refund/approve/{orderId}")]
        public async Task<IActionResult> ApproveRefund(Guid orderId)
        {
            var success = await _purchaseService.ApproveRefundAsync(orderId);

            if (success)
                return Ok(new { message = "Refund approved and stock updated." });

            return BadRequest(new { message = "Refund approval failed. Order not in refund requested state or invalid." });
        }

        [Authorize(Roles = "SalesManager")]
        [HttpGet("revenue")]
        public async Task<ActionResult<RevenueReportDto>> GetRevenueReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var report = await _purchaseService.GetRevenueReportAsync(startDate, endDate);
            return Ok(report);
        }

        [Authorize(Roles = "SalesManager")]
        [HttpGet("refund/requested-orders")]
        public async Task<ActionResult<IEnumerable<Guid>>> GetRefundRequestedOrderIds()
        {
            var results = await _purchaseService.GetRefundRequestedOrderIdsAsync();
            return Ok(results);
        }

    }

}
