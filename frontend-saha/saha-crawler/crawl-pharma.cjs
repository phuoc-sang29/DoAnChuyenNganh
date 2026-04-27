const axios = require('axios');
const cheerio = require('cheerio');

const API_URL = 'http://localhost:5246/api/Blogs';

async function crawlDeepBlogs() {
    console.log("🚀 Đang khởi động Siêu Crawler cào nội dung thật...");
    
    try {
        // 1. Quét danh mục Dinh Dưỡng của VNExpress để lấy Link bài
        console.log("⏳ Đang quét danh sách bài viết từ VNExpress Dinh Dưỡng...");
        const response = await axios.get('https://vnexpress.net/suc-khoe/dinh-duong');
        const $ = cheerio.load(response.data);
        
        const articles = [];
        
        $('article.item-news').each((index, element) => {
            // Chỉ lấy 10 bài mới nhất
            if (articles.length >= 10) return false;
            
            const title = $(element).find('h3.title-news a').text().trim();
            const link = $(element).find('h3.title-news a').attr('href');
            
            // Lấy link ảnh thật
            let imgTag = $(element).find('picture img');
            let imageUrl = imgTag.attr('data-src') || imgTag.attr('src');
            
            if (title && link && imageUrl) {
                articles.push({ title, link, imageUrl });
            }
        });

        console.log(`✅ Tìm thấy ${articles.length} bài. Bắt đầu chui vào từng bài để cào chữ...`);

        // 2. Vòng lặp truy cập vào từng link để cào chi tiết nội dung
        let successCount = 0;
        for (let article of articles) {
            try {
                // Tải trang chi tiết của bài viết đó
                const detailRes = await axios.get(article.link);
                const $detail = cheerio.load(detailRes.data);
                
                // Gom tất cả các đoạn văn (thẻ p.Normal) lại thành một bài văn hoàn chỉnh
                let fullContent = '';
                $detail('p.Normal').each((i, el) => {
                    fullContent += $detail(el).text().trim() + '\n\n';
                });

                // Nếu bài không có chữ (bài dạng Video/Hình ảnh), thì lấy đoạn mô tả ngắn
                if (!fullContent) {
                    fullContent = $detail('p.description').text().trim();
                }

                // Đóng gói dữ liệu bắn sang C#
                const newBlog = {
                    Title: article.title,
                    Content: fullContent,
                    ImageUrl: article.imageUrl
                };

                await axios.post(API_URL, newBlog);
                console.log(`  [OK] Đã cào full nội dung và lưu: ${article.title}`);
                successCount++;
                
            } catch (detailError) {
                console.log(`  [LỖI] Không thể đọc chi tiết bài: ${article.title}`);
            }
        }

        console.log(`🎉 Tuyệt vời! Đã đưa thành công ${successCount} bài viết CHẤT LƯỢNG CAO lên web SaHa.`);

    } catch (error) {
        console.error("❌ Lỗi Crawler tổng:", error.message);
    }
}

crawlDeepBlogs();