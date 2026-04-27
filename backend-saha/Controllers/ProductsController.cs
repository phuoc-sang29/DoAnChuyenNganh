using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_saha.Data;

namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // API: Lấy danh sách sản phẩm (Bao trọn gói: Lấy hết, Lọc theo Category, Brand VÀ TÌM KIẾM)
        [HttpGet]
        public async Task<IActionResult> GetAllProducts(
            [FromQuery] int? categoryId, 
            [FromQuery] string? brand, 
            [FromQuery] string? searchTerm) // BỔ SUNG THAM SỐ TÌM KIẾM
        {
            try
            {
                // Bắt đầu lấy dữ liệu từ bảng Products
                var query = _context.Products.AsQueryable();

                // 1. Lọc theo danh mục (?categoryId=...)
                if (categoryId.HasValue)
                {
                    query = query.Where(p => p.CategoryId == categoryId.Value);
                }

                // 2. Lọc theo thương hiệu (?brand=...)
                if (!string.IsNullOrEmpty(brand))
                {
                    // Dùng ToLower để tìm kiếm không phân biệt hoa thường cho chắc ăn
                    query = query.Where(p => p.Brand != null && p.Brand.ToLower().Contains(brand.ToLower()));
                }

                // 3. TÌM KIẾM THEO TÊN, THƯƠNG HIỆU VÀ XUẤT XỨ (?searchTerm=...)
if (!string.IsNullOrEmpty(searchTerm))
{
    var term = searchTerm.ToLower().Trim(); // Chuyển từ khóa về chữ thường và cắt khoảng trắng dư

    // Quét 1 lượt cả 3 cột: Name HOẶC Brand HOẶC Origin
    query = query.Where(p => 
        (p.Name != null && p.Name.ToLower().Contains(term)) ||
        (p.Brand != null && p.Brand.ToLower().Contains(term)) ||
        (p.Origin != null && p.Origin.ToLower().Contains(term))
    );
}

                // Thực thi và trả về kết quả
                var products = await query.ToListAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy sản phẩm: " + ex.Message });
            }
        }
        
        // API: Lấy chi tiết 1 sản phẩm theo ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);

                if (product == null)
                {
                    return NotFound(new { message = "Không tìm thấy sản phẩm này" });
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy chi tiết sản phẩm: " + ex.Message });
            }
        }
    }
}