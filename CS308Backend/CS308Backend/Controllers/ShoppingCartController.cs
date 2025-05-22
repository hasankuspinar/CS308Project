using CS308Backend.Models;
using CS308Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace CS308Backend.Controllers
{
    [ApiController]
    [Route("/cart")]
    public class ShoppingCartController : Controller
    {
        private readonly IShoppingCartService _cartService;

        public ShoppingCartController(IShoppingCartService cartService)
        {
            _cartService = cartService;
        }

        private (int? userId, Guid? guestCartId) GetCartIdentifiers()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
                return (int.Parse(userIdClaim.Value), null);

            var guestCartIdCookie = Request.Cookies["GuestCartId"];
            if (guestCartIdCookie != null && Guid.TryParse(guestCartIdCookie, out var guestCartId))
                return (null, guestCartId);

            var newGuestCartId = Guid.NewGuid();
            Response.Cookies.Append("GuestCartId", newGuestCartId.ToString(), new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });
            return (null, newGuestCartId);
        }

        [HttpGet]
        public async Task<ActionResult<List<CartItem>>> GetCart()
        {
            var (userId, guestCartId) = GetCartIdentifiers();
            var cart = await _cartService.GetCartAsync(userId, guestCartId);
            return Ok(cart);
        }

        [HttpPost]
        public async Task<IActionResult> AddOrUpdate([FromBody] CartItemDTO dto)
        {
            var (userId, guestCartId) = GetCartIdentifiers();
            await _cartService.AddOrUpdateCartItemAsync(userId, guestCartId, dto, false);
            return Ok();
        }

        [HttpPut("{productId}")]
        public async Task<IActionResult> Update(int productId, [FromBody] int quantity)
        {
            var (userId, guestCartId) = GetCartIdentifiers();
            await _cartService.AddOrUpdateCartItemAsync(userId, guestCartId, new CartItemDTO { ProductId = productId, Quantity = quantity }, true);
            return Ok();
        }

        [HttpDelete("{productId}")]
        public async Task<IActionResult> Remove(int productId)
        {
            var (userId, guestCartId) = GetCartIdentifiers();
            await _cartService.RemoveCartItemAsync(userId, guestCartId, productId);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> Clear()
        {
            var (userId, guestCartId) = GetCartIdentifiers();
            await _cartService.ClearCartAsync(userId, guestCartId);
            return Ok();
        }
    }
}
