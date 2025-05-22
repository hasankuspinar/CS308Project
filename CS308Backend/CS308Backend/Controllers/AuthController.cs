using CS308Backend.Models;
using CS308Backend.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace CS308Backend.Controllers
{
    [Route("/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IShoppingCartService _cartService;

        public AuthController(IAuthService authService, IShoppingCartService cartService)
        {
            _authService = authService;
            _cartService = cartService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerdto)
        {
            if (await _authService.Register(registerdto.Email, registerdto.Password))
                return Ok(new { message = "User registered successfully" });
            return BadRequest("Email already exists");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO logindto)
        {
            var userId = await _authService.Login(logindto.Email, logindto.Password, HttpContext);

            if (userId == null)
            {
                return BadRequest(new { message = "Invalid email or password." });
            }

            var guestCartIdCookie = Request.Cookies["GuestCartId"];
            if (!string.IsNullOrEmpty(guestCartIdCookie) && Guid.TryParse(guestCartIdCookie, out var guestCartId))
            {
                await _cartService.MergeGuestCartIntoUserAsync(guestCartId, userId.Value);
                Response.Cookies.Delete("GuestCartId");
            }

            return Ok(new { message = "Login successful" });
        }


        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logout successful" });
        }

        [Authorize]
        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(new { message = "Authenticated" });
        }

        [HttpGet("getuserdetailsbyuserid")]
        public async Task<IActionResult> GetUserDetailsByUserId([FromQuery] int userId)
        {
            var userDetails = await _authService.GetUserDetailsByUserId(userId);
            if (userDetails == null)
                return NotFound(new { message = "User not found." });

            return Ok(userDetails);
        }

        [Authorize]
        [HttpGet("getuserrole")]
        public IActionResult GetUserRole()
        {
            var roleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);

            return Ok(new { role = roleClaim?.Value });
        }

        [Authorize]
        [HttpGet("getuserdetails")]
        public async Task<IActionResult> GetUserDetails()
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(new { message = "User not authenticated." });

            var userId = int.Parse(userIdClaim.Value);
            var userDetails = await _authService.GetUserDetailsByUserId(userId);
            if (userDetails == null)
                return NotFound(new { message = "User not found." });

            return Ok(userDetails);
        }

        [Authorize]
        [HttpPut("updateuser")]
        public async Task<IActionResult> UpdateUser([FromBody] UserUpdateDTO userUpdateDTO)
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(new { message = "User not authenticated." });

            var userId = int.Parse(userIdClaim.Value);
            await _authService.UpdateUserAsync(userUpdateDTO, userId);

            return Ok(new { message = "User updated successfully." });
        }

    }
}
