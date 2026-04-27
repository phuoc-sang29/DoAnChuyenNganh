using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_saha.Data;
using backend_saha.Models;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Threading.Tasks;

namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // 1. Chỉ khai báo ĐÚNG 1 LẦN ở đây
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;

        // 2. Chỉ có 1 hàm khởi tạo duy nhất
        public AuthController(ApplicationDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        // =======================================================
        // 1. API ĐĂNG KÝ
        // =======================================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try 
            {
                var emailLower = request.Email.ToLower();
                if (await _context.Users.AnyAsync(u => u.Email.ToLower() == emailLower || u.Username == request.Username))
                {
                    return BadRequest(new { message = "Email hoặc Tên đăng nhập đã tồn tại!" });
                }

                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var user = new User
                {
                    Id = Guid.NewGuid(), 
                    Username = request.Username,
                    Email = request.Email,
                    Password = hashedPassword,
                    RoleId = 3, 
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var profile = new Profile
                {
                    UserId = user.Id,
                    FullName = request.FullName
                };
                
                _context.Profiles.Add(profile);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Chúc mừng Hào! Tạo tài khoản thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi đăng ký: " + ex.Message });
            }
        }

        // =======================================================
        // 2. API ĐĂNG NHẬP
        // =======================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

                if (user == null)
                {
                    return BadRequest(new { message = "Email này chưa được đăng ký!" });
                }

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);

                if (!isPasswordValid)
                {
                    return BadRequest(new { message = "Mật khẩu không chính xác!" });
                }

                var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == user.Id);

                return Ok(new { 
                    message = "Đăng nhập thành công!", 
                    user = new { 
                        user.Id, 
                        user.Username, 
                        user.Email, 
                        FullName = profile?.FullName 
                    } 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // =======================================================
        // 3. API TEST KẾT NỐI
        // =======================================================
        [HttpGet("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            var isConnected = await _context.Database.CanConnectAsync();
            return isConnected ? Ok("🟢 Kết nối Supabase tốt!") : StatusCode(500, "🔴 Lỗi kết nối!");
        }

        // =======================================================
        // HÀM PHỤ TRỢ: GỬI EMAIL THẬT BẰNG GMAIL
        // =======================================================
        private async Task SendEmailAsync(string toEmail, string otp)
        {
            var email = new MimeMessage();
            
            // 🔴 BƯỚC 1: ĐIỀN GMAIL CỦA HÀO VÀO CHỖ NÀY
            string myGmail = "nguyennhathao13032004@gmail.com"; 
            
            // 🔴 BƯỚC 2: ĐIỀN MẬT KHẨU ỨNG DỤNG 16 CHỮ VÀO CHỖ NÀY (Viết liền, không có dấu cách)
            string myAppPassword = "oulakndwlpsmlxvl";

            email.From.Add(new MailboxAddress("Nhà thuốc SaHa", myGmail));
            email.To.Add(new MailboxAddress("Khách hàng", toEmail));
            
            email.Subject = "Mã xác nhận khôi phục mật khẩu - SaHa Pharmacy";
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html) {
                Text = $@"
                    <div style='font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #f1f1f1; border-radius: 10px; max-width: 500px; margin: auto;'>
                        <h2 style='color: #ea580c; margin-bottom: 5px;'>Nhà thuốc SaHa</h2>
                        <p style='color: #555;'>Mã xác nhận (OTP) để khôi phục mật khẩu của bạn là:</p>
                        <h1 style='color: #ea580c; font-size: 40px; letter-spacing: 8px; margin: 20px 0;'>{otp}</h1>
                        <p style='color: #888; font-size: 13px;'>Mã này sẽ tự động hết hạn sau 5 phút.</p>
                        <p style='color: #888; font-size: 12px; margin-top: 30px;'>Nếu bạn không yêu cầu, vui lòng bỏ qua email này để bảo vệ tài khoản.</p>
                    </div>"
            };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(myGmail, myAppPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }

        // =======================================================
        // 4. API QUÊN MẬT KHẨU (TẠO OTP & GỬI MAIL)
        // =======================================================
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return BadRequest(new { message = "Không tìm thấy tài khoản với email này." });
            }

            // Tạo mã OTP ngẫu nhiên 6 chữ số
            string otp = new Random().Next(100000, 999999).ToString();

            // Lưu OTP vào RAM máy chủ (hết hạn sau 5 phút)
            _cache.Set(request.Email, otp, TimeSpan.FromMinutes(5));

            try
            {
                await SendEmailAsync(request.Email, otp);
                return Ok(new { message = "Đã gửi mã xác nhận tới email của bạn!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi gửi mail (Kiểm tra lại Mật khẩu ứng dụng 16 chữ): " + ex.Message });
            }
        }

        // =======================================================
        // 5. API XÁC NHẬN OTP & ĐỔI MẬT KHẨU
        // =======================================================
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            // Kiểm tra mã OTP trong RAM
            if (!_cache.TryGetValue(request.Email, out string? savedOtp) || savedOtp != request.Otp)
            {
                return BadRequest(new { message = "Mã xác nhận không đúng hoặc đã hết hạn (quá 5 phút)." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return BadRequest(new { message = "Lỗi xác thực." });

            // BĂM MẬT KHẨU MỚI TRƯỚC KHI LƯU 
            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword); 
            await _context.SaveChangesAsync();

            // Xóa mã OTP sau khi đổi pass thành công
            _cache.Remove(request.Email);

            return Ok(new { message = "Khôi phục mật khẩu thành công!" });
        }
    }

    // =======================================================
    // CÁC CLASS DỮ LIỆU (NẰM NGOÀI CONTROLLER)
    // Đã thêm = string.Empty; để hết báo lỗi gạch dưới
    // =======================================================
    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }
    
    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
    
}