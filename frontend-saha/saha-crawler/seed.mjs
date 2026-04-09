import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

// 1. GẮN CỨNG TRỰC TIẾP SERVICE_ROLE KEY
const supabaseUrl = 'https://xravgzuwcjcrelicdvpu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYXZnenV3Y2pjcmVsaWNkdnB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2NTQyOSwiZXhwIjoyMDg1MjQxNDI5fQ.T0DBkN_1Fx53gLae5VS6yGeZztk_eFGQjFKUp9inamk';

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Cấu hình danh mục
const categoryMap = {
  'vitamin-khoang-chat.json': 1,
  'mien-dich-de-khang.json': 2,
  'sinh-ly-noi-tiet-to.json': 3,
  'mat-thi-luc.json': 4,
  'tieu-hoa.json': 5,
  'than-kinh-nao.json': 6,
  'ho-tro-lam-dep.json': 7,
  'duong-huyet-tieu-duong.json': 8,
  'tim-mach-huyet-ap.json': 9,
  'ho-hap-tai-mui-hong.json': 10,
  'co-xuong-khop.json': 11,
  'gan-mat.json': 12,
  'than-tiet-nieu.json': 13
};

async function seedAllDatabases() {
  try {
    console.log("Bat dau doc va nap du lieu hang loat tu cac file JSON (Che do Root)...");
    const files = Object.keys(categoryMap);

    for (const fileName of files) {
      try {
        const rawData = await fs.readFile(fileName, 'utf-8');
        const scrapedProducts = JSON.parse(rawData);
        const categoryId = categoryMap[fileName];

        console.log(`\n--- Dang xu ly file: ${fileName} (Ghi vao Category ID: ${categoryId}) ---`);

        for (const item of scrapedProducts) {
          const originValue = item.specs['Nước sản xuất'] || item.specs['Thương hiệu'] || 'Chưa rõ';
          const specValue = item.specs['Quy cách'] || item.specs['Dạng bào chế'] || 'Chưa rõ';
          const shortDescription = item.fullContent ? item.fullContent.substring(0, 500) + '...' : 'Chưa có mô tả';

          // Insert vao bang products
          const { data: insertedProduct, error: productError } = await supabase
            .from('products')
            .insert([
              { 
                name: item.name, 
                price: item.price, 
                image_url: item.imgUrl,
                origin: originValue.substring(0, 250),
                specs: specValue.substring(0, 250),
                description: shortDescription,
                category_id: categoryId
              }
            ])
            .select(); 

          if (productError) {
            console.error(`Loi insert san pham [${item.name}]:`, productError.message);
            continue;
          }

          const newProductId = insertedProduct[0].id;

          // Insert vao bang ai_knowledge_base
          const aiContent = `[Thông số Kỹ thuật]: ${JSON.stringify(item.specs, null, 2)}\n\n[Nội dung chi tiết]:\n${item.fullContent}`;

          const { error: aiError } = await supabase
            .from('ai_knowledge_base')
            .insert([
              {
                product_id: newProductId,
                full_content: aiContent,
                content_chunk: aiContent // ĐÃ BỔ SUNG CỘT NÀY ĐỂ FIX LỖI NOT NULL
              }
            ]);

          if (aiError) {
            console.error(`Loi insert AI Data [${item.name}]:`, aiError.message);
          } else {
            console.log(`Dong bo thanh cong: ${item.name}`);
          }
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log(`Bo qua file ${fileName} (Chua co du lieu).`);
        } else {
          console.error(`Loi khi doc file ${fileName}:`, err.message);
        }
      }
    }

    console.log("\nHoan tat toan bo quy trinh nap du lieu cho he thong SaHa.");

  } catch (error) {
    console.error("Loi he thong tong:", error.message);
  }
}

seedAllDatabases();