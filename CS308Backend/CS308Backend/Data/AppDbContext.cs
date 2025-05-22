using CS308Backend.Models;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
namespace CS308Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> User { get; set; }

        public DbSet<Product> Product { get; set; }

        public DbSet<Comment> Comment { get; set; }

        public DbSet<Rating> Rating { get; set; }

        public DbSet<Purchase> Purchase { get; set; }
        public DbSet<Delivery> Delivery { get; set; }
        public DbSet<CartItem> CartItem { get; set; }
        public DbSet<Category> Category { get; set; }
        public DbSet<Wishlist> Wishlist { get; set; }
    }
}
