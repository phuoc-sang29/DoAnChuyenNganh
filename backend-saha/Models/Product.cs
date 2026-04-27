using System.ComponentModel.DataAnnotations.Schema;

namespace backend_saha.Models
{
    // Báo cho C# biết tên bảng chính xác trong DB
    [Table("products")]
    public class Product
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("category_id")]
        public int? CategoryId { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("ingredients")]
        public string? Ingredients { get; set; }

        [Column("uses")]
        public string? Uses { get; set; }

        [Column("dosage")]
        public string? Dosage { get; set; }

        [Column("contraindications")]
        public string? Contraindications { get; set; }

        [Column("price")]
        public decimal Price { get; set; }

        // BẮT ĐÚNG CỘT TỒN KHO
        [Column("stock_qty")]
        public int StockQty { get; set; }

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        // BẮT ĐÚNG CÁC CỘT MỚI THÊM VÀO
        [Column("description")]
        public string? Description { get; set; }

        [Column("origin")]
        public string? Origin { get; set; }

        [Column("specs")]
        public string? Specs { get; set; }
        [Column("brand")]
        public string? Brand { get; set; }
    }
}