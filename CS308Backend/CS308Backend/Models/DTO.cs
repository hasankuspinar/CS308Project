namespace CS308Backend.Models
{
    public class CommentCreateDto
    {
        public string ProductComment { get; set; }
    }

    public class RatingCreateDto
    {
        public double ProductRating { get; set; }
    }

    public class PurchaseCreateDto
    {
        public int Quantity { get; set; }
        public string DeliveryAddress { get; set; }
    }

    public class CheckoutItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class CheckoutRequestDto
    {
        public List<CheckoutItemDto> Items { get; set; }
        public string DeliveryAddress { get; set; }
        public string FirstName { get; set; }  
        public string LastName { get; set; }    
    }
    public class InvoiceRequestDto
    {
        public Guid OrderId { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class ProductDto
    {
        public string ProductName { get; set; }

        public string Model { get; set; }

        public int SerialNumber { get; set; }

        public string Description { get; set; }

        public int Quantity { get; set; }

        public double Price { get; set; }

        public string Distributor { get; set; }

        public Status WarrantyStatus { get; set; }

        public string ImageURL { get; set; }
        public int CategoryId { get; set; }
    }

    public class CartItemDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class UserDTO
    {
        public int UserId { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Name { get; set; }
        public string HomeAddress { get; set; }
    }

    public class UserUpdateDTO
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string HomeAddress { get; set; }
    }

    public class PurchaseDetailsDto
    {
        public int PurchaseId { get; set; }
        public int ProductId { get; set; }
        public int UserId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public DateTime Date { get; set; }
        public string DeliveryAddress { get; set; }
        public double? TotalPrice { get; set; }
        public string Status { get; set; }
        public Guid? OrderId { get; set; }
    }

    public class DiscountRequestDto
    {
        public List<int> ProductIds { get; set; }
        public double DiscountPercentage { get; set; }
    }

    public class RevenueReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double TotalRevenue { get; set; }
        public double TotalCost { get; set; }
        public double Profit { get; set; }
    }

}
