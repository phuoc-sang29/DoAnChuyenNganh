using Microsoft.EntityFrameworkCore;
using backend_saha.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình Database kết nối Supabase (ĐÃ THÊM THUỐC ĐẶC TRỊ LỖI SUPABASE)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.MaxBatchSize(1) // 👈 VIÊN THUỐC ĐẶC TRỊ NẰM Ở ĐÂY SẾP NHÉ! CHỐNG GỘP LỆNH!
    )
);

// 2. Cấu hình CORS (Mở toang cửa cho mọi Frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.AllowAnyOrigin()  
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddMemoryCache(); // Bật tính năng lưu trữ tạm thời cho OTP
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3. ÉP BUỘC BẬT SWAGGER (Để lát mình test API trực tiếp luôn)
app.UseSwagger();
app.UseSwaggerUI();

// ==========================================
// THỨ TỰ DƯỚI ĐÂY LÀ BẮT BUỘC, KHÔNG ĐƯỢC ĐỔI
// ==========================================
app.UseRouting();             // BƯỚC 1: Bắt buộc phải có Routing trước
app.UseCors("AllowReactApp"); // BƯỚC 2: Gọi CORS sau Routing
app.UseAuthorization();       // BƯỚC 3: Gọi Auth sau CORS
// ==========================================

// 4. Bật đường dẫn cho các file Controller
app.MapControllers();

// 5. Đường dẫn test gốc
app.MapGet("/", () => "Tuyet voi Hao oi! Backend da chinh thuc hoat dong!");

app.Run();