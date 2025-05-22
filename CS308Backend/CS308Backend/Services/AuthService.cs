using CS308Backend.Data;
using CS308Backend.Models;
using CS308Backend.Repositories;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace CS308Backend.Services
{
    public interface IAuthService
    {
        Task<bool> Register(string email, string password);
        Task<int?> Login(string email, string password, HttpContext httpContext);
        Task<UserDTO?> GetUserDetailsByUserId(int userId);
        Task UpdateUserAsync(UserUpdateDTO userUpdateDTO, int userId);
    }
    public class AuthService:IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IUserRepository _userRepository;
        public AuthService(AppDbContext context, IUserRepository userRepository)
        {
            _context = context;
            _userRepository = userRepository;
        }

        public async Task<bool> Register(string email, string password)
        {
            var existingUser = await _userRepository.GetUserByEmail(email);
            if (existingUser != null)
                return false;
            var combinedPassword = $"{email}{password}";
            var newUser = new User { Email = email, Role = UserRole.Customer};
            newUser.Password = ComputeSha512Hash(combinedPassword);
            await _userRepository.AddUser(newUser);
            return true;
        }
        public async Task<int?> Login(string email, string password, HttpContext httpContext)
        {
            var user = await _userRepository.GetUserByEmail(email);
            if (user == null)
                return null;

            var combinedPassword = $"{email}{password}";
            var userPassword = user.Password;
            var hashedPassword = ComputeSha512Hash(combinedPassword);

            if (userPassword != hashedPassword)
                return null;

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(20)
            };

            await httpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

            return user.UserID;  
        }
        private string ComputeSha512Hash(string input)
        {
            using (var sha512 = SHA512.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(input);
                var hash = sha512.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        public async Task<UserDTO?> GetUserDetailsByUserId(int userId)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                return null;

            return new UserDTO
            {
                UserId = user.UserID,
                Email = user.Email,
                Role = user.Role.ToString(),
                HomeAddress = user.HomeAddress,
                Name = user.Name,
            };
        }

        public async Task UpdateUserAsync(UserUpdateDTO userUpdateDTO, int userId)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                throw new Exception("User not found");

            user.Name = userUpdateDTO.Name;
            user.HomeAddress = userUpdateDTO.HomeAddress;

            _context.User.Update(user);
            await _context.SaveChangesAsync();
        }         

    }
}
