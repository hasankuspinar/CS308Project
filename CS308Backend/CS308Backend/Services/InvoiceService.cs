using CS308Backend.Models;
using CS308Backend.Repositories;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.Collections.Generic;
using System.Globalization;

namespace CS308Backend.Services
{
    public interface IInvoiceService
    {
        byte[] GenerateInvoicePdf(List<Purchase> purchases, List<Delivery> deliveries, List<Product> products, User user, string firstName, string lastName);
    }
    public class InvoiceService : IInvoiceService
    {
        private readonly IPurchaseRepository _purchaseRepository;
        private readonly IUserRepository _userRepository;
        private readonly IProductRepository _productRepository;
        private readonly IDeliveryRepository _deliveryRepository;

        public InvoiceService(IPurchaseRepository purchaseRepository, IProductRepository productRepository, IDeliveryRepository deliveryRepository, IUserRepository userRepository)
        {
            _purchaseRepository = purchaseRepository;
            _productRepository = productRepository;
            _deliveryRepository = deliveryRepository;
            _userRepository = userRepository;
        }
        public byte[] GenerateInvoicePdf(List<Purchase> purchases, List<Delivery> deliveries, List<Product> products, User user, string firstName, string lastName)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(30);
                    page.Header().Column(col =>
                    {
                        col.Item().Text($"Invoice for {firstName} {lastName}").FontSize(20).Bold();
                        col.Item().Text($"Email: {user.Email}").FontSize(12);
                    });

                    page.Content().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Product Name").Bold();
                            header.Cell().Text("Quantity").Bold();
                            header.Cell().Text("Date").Bold();
                            header.Cell().Text("Address").Bold();
                            header.Cell().Text("Status").Bold();
                            header.Cell().Text("Total Price").Bold();
                        });

                        foreach (var purchase in purchases)
                        {
                            var delivery = deliveries.FirstOrDefault(d => d.PurchaseID == purchase.Id);
                            var product = products.FirstOrDefault(p => p.Id == purchase.ProductId);

                            table.Cell().Text(product?.ProductName ?? "(Unknown)");
                            table.Cell().Text(purchase.Quantity.ToString());
                            table.Cell().Text(purchase.Date.ToShortDateString());
                            table.Cell().Text(delivery?.DeliveryAddress ?? "-");
                            table.Cell().Text(delivery?.Status.ToString() ?? "-");
                            table.Cell().Text(delivery?.TotalPrice.ToString("C", CultureInfo.GetCultureInfo("en-US")) ?? "-");
                        }
                    });

                    page.Footer().AlignCenter().Text($"Generated on {DateTime.Now:dd.MM.yyyy}");
                });
            });

            return document.GeneratePdf();
        }

    }
}

