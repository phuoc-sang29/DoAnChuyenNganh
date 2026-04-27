using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_saha.Data;
using backend_saha.Models;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BlogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. API lấy bài viết ra (Dành cho trang chủ React & Danh sách)
        [HttpGet]
        public async Task<IActionResult> GetBlogs()
        {
            var blogs = await _context.Blogs
                                .OrderByDescending(b => b.CreatedAt)
                                .Take(10)
                                .ToListAsync();
            return Ok(blogs);
        }

        // 2. API thêm bài viết mới (Dành cho Node.js Crawler bắn vào)
        [HttpPost]
        public async Task<IActionResult> CreateBlog([FromBody] Blog blog)
        {
            try
            {
                blog.CreatedAt = DateTime.UtcNow;
                _context.Blogs.Add(blog);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Lưu bài viết thành công!", data = blog });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lưu: " + ex.Message });
            }
        }

        // =======================================================
        // 3. API MỚI BỔ SUNG: LẤY CHI TIẾT 1 BÀI VIẾT BẰNG ID
        // =======================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBlogById(int id)
        {
            try
            {
                // Tìm bài viết trong Database khớp với số ID gửi lên
                var blog = await _context.Blogs.FindAsync(id);
                
                if (blog == null) 
                {
                    return NotFound(new { message = "Không tìm thấy bài viết" });
                }
                
                return Ok(blog);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}