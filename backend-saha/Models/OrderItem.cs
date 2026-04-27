using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_saha.Models
{
    [Table("order_items")]
    public class OrderItem
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("order_id")]
        [ForeignKey("Order")] // DẠY CHO C# BIẾT ĐÂY LÀ KHÓA NGOẠI
        public Guid OrderId { get; set; }

        [Column("product_id")]
        public Guid ProductId { get; set; }

        [Column("qty")]
        public int Qty { get; set; }

        [Column("price_at_purchase")]
        public decimal PriceAtPurchase { get; set; }

        // MỐI QUAN HỆ ĐẾN BẢNG ORDER
        public Order Order { get; set; } 
    }
}