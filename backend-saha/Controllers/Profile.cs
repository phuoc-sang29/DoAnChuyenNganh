using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_saha.Models
{
    [Table("profiles")]
    public class Profile
    {
        [Key] // Ép UserId làm khóa chính duy nhất
        [Column("user_id")]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Column("full_name")]
        public string? FullName { get; set; }

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("avatar_url")]
        public string? AvatarUrl { get; set; }
    }
}