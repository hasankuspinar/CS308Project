using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public interface IUserRepository
    {
        Task<User> GetUserByEmail(string email);
        Task<User> GetUserById(int userid);
        Task AddUser(User user);
    }
}
