namespace CS308Backend.Models
{
    public class Product
    {
        public int Id { get; set; }

        public string ProductName { get; set; }

        public string Model { get; set; }

        public int SerialNumber { get; set; }

        public string Description { get; set; }

        public int Quantity { get; set; }

        public double Price { get; set; }
        public double OldPrice { get; set; }

        public string Distributor { get; set; }

        public Status WarrantyStatus { get; set; }

        public string ImageURL { get; set; }
        public int CategoryId { get; set; }

    }

    public enum Status
    {
        Valid,
        Expired
    }
}
