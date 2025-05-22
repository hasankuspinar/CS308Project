using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Options;
using CS308Backend.Settings;

namespace CS308Backend.Services
{
    public interface IEmailService
    {
        Task SendInvoiceEmailAsync(string toEmail, byte[] pdfBytes);

        Task SendEmailAsync(string toEmail, string subject, string body);
    }
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtpSettings;

        public EmailService(IOptions<SmtpSettings> smtpOptions)
        {
            _smtpSettings = smtpOptions.Value;
        }

        public async Task SendInvoiceEmailAsync(string toEmail, byte[] pdfBytes)
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(_smtpSettings.FromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = "Your Invoice";

            var builder = new BodyBuilder
            {
                TextBody = "Thank you for your purchase! Please find your invoice attached."
            };

            builder.Attachments.Add("invoice.pdf", pdfBytes, ContentType.Parse("application/pdf"));
            message.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, _smtpSettings.EnableSsl);
            await smtp.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(_smtpSettings.FromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder
            {
                TextBody = body
            };
            message.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, _smtpSettings.EnableSsl);
            await smtp.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }
    }
}

