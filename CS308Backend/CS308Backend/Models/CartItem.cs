using System.ComponentModel.DataAnnotations;

namespace CS308Backend.Models
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }

        public Guid? GuestCartId { get; set; }

        public int ProductId { get; set; }

        public int Quantity { get; set; }
    }
}

