using System.ComponentModel.DataAnnotations;

namespace CS308Backend.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public string Password { get; set; }
        public string? HomeAddress { get; set; }
        public string? Name { get; set; }

    }
    public enum UserRole
    {
        Customer,
        SalesManager,
        ProductManager
    }
}
