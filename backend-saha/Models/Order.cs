using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_saha.Models
{
    [Table("orders")]
    public class Order
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("user_id")]
        public Guid? UserId { get; set; }

        [Column("total_amount")]
        public decimal TotalAmount { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("shipping_address")]
        public string ShippingAddress { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}