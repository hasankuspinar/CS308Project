
using Xunit;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using CS308Backend.Controllers;
using CS308Backend.Models;
using CS308Backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;

namespace CS308Backend.Tests.Controllers
{
    public class ControllerTests
    {
        private ControllerContext GetMockContext(int userId = 1, string role = "Customer")
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role)
            }, "mock"));

            return new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task Register_ReturnsOk_WhenSuccessful()
        {
            var mockService = new Mock<IAuthService>();
            mockService.Setup(x => x.Register("test@test.com", "pass")).ReturnsAsync(true);
            var controller = new AuthController(mockService.Object);

            var result = await controller.Register(new RegisterDTO { Email = "test@test.com", Password = "pass" });

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenEmailExists()
        {
            var mockService = new Mock<IAuthService>();
            mockService.Setup(x => x.Register("test@test.com", "pass")).ReturnsAsync(false);
            var controller = new AuthController(mockService.Object);

            var result = await controller.Register(new RegisterDTO { Email = "test@test.com", Password = "pass" });

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Login_ReturnsOk_WhenSuccessful()
        {
            var mockService = new Mock<IAuthService>();
            var mockContext = new DefaultHttpContext();
            mockService.Setup(x => x.Login("test@test.com", "pass", mockContext)).ReturnsAsync(true);

            var controller = new AuthController(mockService.Object)
            {
                ControllerContext = new ControllerContext { HttpContext = mockContext }
            };

            var result = await controller.Login(new LoginDTO { Email = "test@test.com", Password = "pass" });

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Login_ReturnsBadRequest_WhenInvalid()
        {
            var mockService = new Mock<IAuthService>();
            var context = new DefaultHttpContext();
            mockService.Setup(x => x.Login("test@test.com", "wrong", context)).ReturnsAsync(false);

            var controller = new AuthController(mockService.Object)
            {
                ControllerContext = new ControllerContext { HttpContext = context }
            };

            var result = await controller.Login(new LoginDTO { Email = "test@test.com", Password = "wrong" });

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Logout_ReturnsOk()
        {
            var mockService = new Mock<IAuthService>();

            var authService = new Mock<IAuthenticationService>();
            var serviceProvider = new ServiceCollection()
                .AddSingleton(authService.Object)
                .BuildServiceProvider();

            var context = new DefaultHttpContext
            {
                RequestServices = serviceProvider
            };

            var controller = new AuthController(mockService.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = context
                }
            };

            var result = await controller.Logout();

            Assert.IsType<OkObjectResult>(result);
        }


        [Fact]
        public void Status_ReturnsOk_IfAuthenticated()
        {
            var mockService = new Mock<IAuthService>();
            var controller = new AuthController(mockService.Object)
            {
                ControllerContext = GetMockContext()
            };

            var result = controller.GetStatus();
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetAllProducts_ReturnsOk()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.GetAllProductsAsync()).ReturnsAsync(new List<Product>());

            var controller = new ProductController(mockService.Object, null);
            var result = await controller.GetAllProducts();

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetProductById_ReturnsProduct_WhenFound()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.GetProductByIdAsync(1)).ReturnsAsync(new Product { Id = 1 });

            var controller = new ProductController(mockService.Object, null);
            var result = await controller.GetProductById(1);

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetProductById_ReturnsNotFound_WhenMissing()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.GetProductByIdAsync(1)).ReturnsAsync((Product)null);

            var controller = new ProductController(mockService.Object, null);
            var result = await controller.GetProductById(1);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task DeleteProduct_ReturnsOk_WhenSuccess()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.DeleteProductAsync(1)).ReturnsAsync(true);

            var controller = new ProductController(mockService.Object, null);
            var result = await controller.DeleteProduct(1);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task DeleteProduct_ReturnsNotFound_WhenFail()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.DeleteProductAsync(1)).ReturnsAsync(false);

            var controller = new ProductController(mockService.Object, null);
            var result = await controller.DeleteProduct(1);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetProductById_ProductExists_ReturnsOk()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.GetProductByIdAsync(1)).ReturnsAsync(new Product { Id = 1 });
            var controller = new ProductController(mockService.Object, null);
            var result = await controller.GetProductById(1);
            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetProductById_ProductNotFound_ReturnsNotFound()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.GetProductByIdAsync(99)).ReturnsAsync((Product)null);
            var controller = new ProductController(mockService.Object, null);
            var result = await controller.GetProductById(99);
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateProduct_ReturnsCreated()
        {
            var mockService = new Mock<IProductService>();
            var dto = new ProductDto { ProductName = "Bag" };
            mockService.Setup(x => x.AddProductAsync(dto)).ReturnsAsync(new Product { Id = 1 });
            var controller = new ProductController(mockService.Object, null);
            var result = await controller.CreateProduct(dto);
            Assert.IsType<CreatedAtActionResult>(result.Result);
        }

        [Fact]
        public async Task DeleteProduct_Existing_ReturnsOk()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.DeleteProductAsync(1)).ReturnsAsync(true);
            var controller = new ProductController(mockService.Object, null);
            var result = await controller.DeleteProduct(1);
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task DeleteProduct_NotFound_ReturnsNotFound()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.DeleteProductAsync(99)).ReturnsAsync(false);
            var controller = new ProductController(mockService.Object, null);
            var result = await controller.DeleteProduct(99);
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task SearchAndSortProducts_ReturnsOk()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.SearchAndSortProductsAsync(null, null, null)).ReturnsAsync(new List<Product>());
            var controller = new ProductController(mockService.Object, null);
            var result = await controller.SearchAndSortProducts(null, null, null);
            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetCommentsByProductId_ReturnsOk()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.GetCommentsByProductIdAsync(1)).ReturnsAsync(new List<Comment>());
            var controller = new ProductController(mockService.Object, null);
            var result = await controller.GetCommentsByProductId(1);
            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetRatingsByProductId_ReturnsOk()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.GetRatingsByProductIdAsync(1)).ReturnsAsync(new List<Rating>());
            var controller = new ProductController(mockService.Object, null);
            var result = await controller.GetRatingsByProductId(1);
            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task AddRating_Invalid_ReturnsBadRequest()
        {
            var mockService = new Mock<IProductService>();
            var controller = new ProductController(mockService.Object, null);
            var context = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                    new Claim(ClaimTypes.NameIdentifier, "1")
                }, "mock"))
                }
            };
            controller.ControllerContext = context;
            mockService.Setup(x => x.AddRatingAsync(1, 1, 5)).ReturnsAsync((Rating)null);

            var result = await controller.AddRating(1, new RatingCreateDto { ProductRating = 5 });
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task AddComment_Invalid_ReturnsBadRequest()
        {
            var mockService = new Mock<IProductService>();
            var controller = new ProductController(mockService.Object, null);
            var context = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                    new Claim(ClaimTypes.NameIdentifier, "1")
                }, "mock"))
                }
            };
            controller.ControllerContext = context;
            mockService.Setup(x => x.AddCommentAsync(1, 1, "Test")).ReturnsAsync((Comment)null);

            var result = await controller.AddComment(1, new CommentCreateDto { ProductComment = "Test" });
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task MakePurchase_Invalid_ReturnsBadRequest()
        {
            var mockService = new Mock<IPurchaseService>();
            var controller = new PurchaseController(mockService.Object, null);
            var context = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                    new Claim(ClaimTypes.NameIdentifier, "1")
                }, "mock"))
                }
            };
            controller.ControllerContext = context;
            mockService.Setup(x => x.MakePurchaseAsync(1, 1, 1)).ReturnsAsync(Guid.Empty);

            var result = await controller.MakePurchase(1, new PurchaseCreateDto { Quantity = 1 });
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task ApproveComment_ReturnsOk_WhenCommentExists()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.GetCommentByIdAsync(1)).ReturnsAsync(new Comment { Id = 1 });
            mockService.Setup(x => x.ApproveCommentAsync(It.IsAny<Comment>())).ReturnsAsync(new Comment());

            var controller = new ProductController(mockService.Object, null)
            {
                ControllerContext = GetMockContext(role: "ProductManager")
            };

            var result = await controller.ApproveComment(1);

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task ApproveComment_ReturnsNotFound_WhenCommentMissing()
        {
            var mockService = new Mock<IProductService>();
            mockService.Setup(x => x.GetCommentByIdAsync(99)).ReturnsAsync((Comment)null);

            var controller = new ProductController(mockService.Object, null)
            {
                ControllerContext = GetMockContext(role: "ProductManager")
            };

            var result = await controller.ApproveComment(99);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task Checkout_ReturnsBadRequest_WhenCheckoutFails()
        {
            var mockService = new Mock<IPurchaseService>();
            mockService.Setup(x => x.ProcessCheckoutAsync(1, It.IsAny<List<CheckoutItemDto>>(), "address"))
                .ReturnsAsync(Guid.Empty);

            var controller = new PurchaseController(mockService.Object, null)
            {
                ControllerContext = GetMockContext()
            };

            var result = await controller.Checkout(new CheckoutRequestDto
            {
                Items = new List<CheckoutItemDto> { new CheckoutItemDto { ProductId = 1, Quantity = 1 } },
                DeliveryAddress = "address"
            });

            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

    }
}
