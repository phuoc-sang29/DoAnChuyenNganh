using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; 
using backend_saha.Data;   
using backend_saha.Models; 
using System.Security.Cryptography;
using System.Text;
using System.Net;
using System.Globalization;

namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context; 

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserOrders(Guid userId)
        {
            try
            {
                var orders = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequestDto request)
        {
            try
            {
                var newOrderId = Guid.NewGuid();
                object userIdParam = request.UserId.HasValue ? request.UserId.Value : DBNull.Value;

                var sqlOrder = "INSERT INTO orders (id, user_id, total_amount, shipping_address, status, created_at) VALUES ({0}, {1}, {2}, {3}, {4}, {5})";
                await _context.Database.ExecuteSqlRawAsync(sqlOrder, 
                    newOrderId, userIdParam, request.TotalAmount, request.ShippingAddress, "pending", DateTime.UtcNow);

                foreach (var item in request.Items)
                {
                    var sqlItem = "INSERT INTO order_items (order_id, product_id, qty, price_at_purchase) VALUES ({0}, {1}, {2}, {3})";
                    await _context.Database.ExecuteSqlRawAsync(sqlItem,
                        newOrderId, item.ProductId, item.Qty, item.PriceAtPurchase);
                }

                string paymentUrl = "";
                if (request.PaymentMethod == "banking")
                {
                    paymentUrl = GenerateVnPayUrl(newOrderId, request.TotalAmount);
                }

                return Ok(new { message = "Đặt hàng thành công!", orderId = newOrderId, paymentUrl = paymentUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi Database: " + ex.Message });
            }
        }

        private string GenerateVnPayUrl(Guid orderId, decimal amount)
        {
            // CẬP NHẬT MÃ MỚI CỦA SẾP VÀO ĐÂY
            string vnp_TmnCode = "R0IO82L0";
            string vnp_HashSecret = "7F37Q9ZUQXHF6HI8DEZTPXM1YELS9NXY";
            string vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
            string vnp_Returnurl = "http://localhost:5173/order-history";

            VnPayLibrary vnpay = new VnPayLibrary();

            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
            vnpay.AddRequestData("vnp_Amount", ((long)(amount * 100)).ToString()); 
            
            DateTime vnTime = DateTime.UtcNow.AddHours(7);
            vnpay.AddRequestData("vnp_CreateDate", vnTime.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_IpAddr", "127.0.0.1"); 
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", "ThanhToanDonHang" + orderId.ToString().Replace("-", ""));
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_Returnurl);
            vnpay.AddRequestData("vnp_TxnRef", vnTime.Ticks.ToString()); 

            return vnpay.CreateRequestUrl(vnp_Url, vnp_HashSecret);
        }
    }

    public class VnPayLibrary
    {
        private SortedList<string, string> _requestData = new SortedList<string, string>(new VnPayCompare());

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _requestData.Add(key, value);
            }
        }

        public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
        {
            StringBuilder data = new StringBuilder();
            foreach (KeyValuePair<string, string> kv in _requestData)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    // VNPay bắt buộc dấu cách phải là %20 chứ không phải dấu +
                    data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value).Replace("+", "%20") + "&");
                }
            }
            string queryString = data.ToString();

            baseUrl += "?" + queryString;
            string signData = queryString;
            if (signData.Length > 0)
            {
                signData = signData.Remove(data.Length - 1, 1);
            }

            string vnp_SecureHash = HmacSHA512(vnp_HashSecret, signData);
            baseUrl += "vnp_SecureHash=" + vnp_SecureHash;

            return baseUrl;
        }

        private string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }

        private class VnPayCompare : IComparer<string>
        {
            public int Compare(string x, string y)
            {
                if (x == y) return 0;
                if (x == null) return -1;
                if (y == null) return 1;
                var vnpCompare = CompareInfo.GetCompareInfo("en-US");
                return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
            }
        }
    }

    public class OrderRequestDto
    {
        public Guid? UserId { get; set; } 
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; }
        public string PaymentMethod { get; set; } 
        public List<OrderItemDto> Items { get; set; }
    }

    public class OrderItemDto
    {
        public Guid ProductId { get; set; }
        public int Qty { get; set; }
        public decimal PriceAtPurchase { get; set; }
    }
}