using Microsoft.EntityFrameworkCore;
using backend_saha.Models;

namespace backend_saha.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Blog> Blogs { get; set; }
        public DbSet<Order> Orders { get; set; }
public DbSet<OrderItem> OrderItems { get; set; }

        // THÊM ĐOẠN NÀY VÀO ĐỂ ÉP C# DÙNG CHỮ THƯỜNG TRÊN SUPABASE
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
    
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<Product>().ToTable("products");

            // Ép bảng profiles dùng user_id làm Key và không được tìm cột "id"
            modelBuilder.Entity<Profile>(entity => 
            {
                entity.ToTable("profiles");
                entity.HasKey(e => e.UserId); 
            });
        }
    }
}