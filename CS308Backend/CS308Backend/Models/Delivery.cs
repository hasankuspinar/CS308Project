using System.ComponentModel.DataAnnotations;
namespace CS308Backend.Models
{
    public class Delivery
    {
        [Key]
        public int DeliveryID { get; set; }
        public int PurchaseID { get; set; }
        public int CustomerID { get; set; }    
        public int ProductID { get; set; }
        public int Quantity { get; set; }
        public double TotalPrice { get; set; }
        public string DeliveryAddress { get; set; }
        public DeliveryStatus Status { get; set; }
        public Guid OrderId { get; set; }
    }
    public enum DeliveryStatus
    {
        Processing,
        InDelivery,
        Delivered,
        Cancelled,
        RefundRequested,
        Refunded
    }
}
