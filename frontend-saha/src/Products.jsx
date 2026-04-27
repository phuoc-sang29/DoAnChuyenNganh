import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Filter, ChevronDown } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // 1. Dùng useSearchParams để bắt thông tin từ URL
  const [searchParams] = useSearchParams();
  const brandFilter = searchParams.get('brand');
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    setLoading(true);
    
    // 2. Tự động ghép nối link API dựa vào bộ lọc
    const params = new URLSearchParams();
    if (brandFilter) params.append('brand', brandFilter);
    if (categoryFilter) params.append('categoryId', categoryFilter);

    const apiUrl = `http://localhost:5246/api/products?${params.toString()}`;

    axios.get(apiUrl)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải sản phẩm:", err);
        setLoading(false);
      });
  }, [brandFilter, categoryFilter]); // 3. Chạy lại useEffect mỗi khi brand hoặc category trên link thay đổi

  // 4. Linh hoạt thay đổi Tiêu đề trang
  let pageTitle = "Tất Cả Sản Phẩm";
  if (brandFilter) pageTitle = `Thương Hiệu: ${brandFilter}`;
  else if (categoryFilter) pageTitle = `Danh Mục Sản Phẩm`;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-slate-800">{pageTitle}</h2>
          
          <div className="flex gap-4">
            {/* Nút xóa bộ lọc (Chỉ hiện khi đang có lọc) */}
            {(brandFilter || categoryFilter) && (
              <button 
                onClick={() => navigate('/products')}
                className="text-sm font-bold text-orange-500 hover:text-orange-600 underline underline-offset-2"
              >
                Xóa bộ lọc
              </button>
            )}
            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold shadow-sm hover:border-brand/30 transition-colors">
              <Filter size={16} /> Lọc <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-brand font-bold">Đang sắp xếp kệ thuốc...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-bold text-lg mb-4">Không tìm thấy sản phẩm nào phù hợp.</p>
            <button 
              onClick={() => navigate('/products')} 
              className="bg-brand text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map(product => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
              >
                <div className="aspect-square mb-4 rounded-xl overflow-hidden bg-slate-50">
                  <img src={product.imageUrl || "https://placehold.co/400x400/fff7ed/ea580c?text=SaHa"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                </div>
                {/* Đã đổi lại hiển thị Tên thương hiệu cho chuẩn xịn thay vì CategoryID khô khan */}
                <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1 line-clamp-1">
                  {product.brand || 'SaHa Pharma'}
                </p>
                <h4 className="font-bold text-slate-800 text-sm mb-3 line-clamp-2 h-10 leading-tight group-hover:text-brand transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-black text-slate-900">
                    {product.price ? `${product.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                  </span>
                  <button className="w-8 h-8 rounded-full bg-orange-50 text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-colors">
                    <ShoppingCart size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;