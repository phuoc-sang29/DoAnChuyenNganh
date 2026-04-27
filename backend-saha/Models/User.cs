using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Bắt buộc phải có dòng này

namespace backend_saha.Models
{
    [Table("users")] // <-- CHÌA KHÓA GIẢI QUYẾT NẰM Ở ĐÂY
    public class User
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }
        
        [Column("username")]
        public string Username { get; set; } 
        
        [Column("email")]
        public string Email { get; set; }
        
        [Column("password")]
        public string Password { get; set; }
        
        [Column("role_id")]
        public int RoleId { get; set; } 
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}