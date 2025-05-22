using CS308Backend.Data;
using CS308Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace CS308Backend.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await _context.User.SingleOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> GetUserById(int userid)
        {
            return await _context.User.FindAsync(userid);
        }
        public async Task AddUser(User user)
        {
            await _context.User.AddAsync(user);
            await _context.SaveChangesAsync();
        }
    }
}
