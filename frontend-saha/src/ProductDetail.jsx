import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, ArrowLeft, Star, ShieldCheck, 
  HeartPulse, Search, ChevronRight 
} from 'lucide-react';

// BỔ SUNG: Khai báo để xài chung Giỏ Hàng
import { useCart } from './CartContext';

// Hàm xử lý nội dung AI tách các mục (Thông số, Công dụng...)
const parseAIContent = (rawText) => {
  if (!rawText) return { specs: null, sections: [] };

  let specsObj = null;
  let mainText = rawText;

  // Lấy thông số kỹ thuật nếu có
  const specRegex = /\[Thông số Kỹ thuật\]:\s*(\{.*?\})\n\n\[Nội dung chi tiết\]:\n/s;
  const match = rawText.match(specRegex);
  
  if (match) {
    try {
      specsObj = JSON.parse(match[1]);
    } catch (e) {
      console.log("Không có thông số kỹ thuật dạng JSON");
    }
    mainText = rawText.replace(match[0], ''); 
  }

  if (!mainText.includes('--- [')) {
    return { specs: specsObj, sections: [{ title: 'Thông tin chi tiết', content: mainText }] };
  }

  const parts = mainText.split('--- [');
  const sections = [];

  parts.forEach(part => {
    if (!part.trim()) return;
    const endIdx = part.indexOf('] ---');
    if (endIdx !== -1) {
      let title = part.substring(0, endIdx).trim();
      if (title.toLowerCase().includes('công dụng')) title = 'Công dụng';
      if (title.toLowerCase().includes('cách dùng')) title = 'Cách dùng';
      if (title.toLowerCase().includes('mô tả')) title = 'Mô tả sản phẩm';
      
      const content = part.substring(endIdx + 5).trim();
      if (content) sections.push({ title, content });
    }
  });

  return { specs: specsObj, sections };
};

const ProductDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  // BỔ SUNG: Lấy hàm thêm vào giỏ và số đếm từ Kho
  const { addToCart, cartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [parsedData, setParsedData] = useState({ specs: null, sections: [] });
  const [activeSection, setActiveSection] = useState(0);

  // Ảnh dự phòng
  const defaultImage = "https://placehold.co/600x600/f97316/ffffff?text=SaHa+Product";

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5246/api/Products/${id}`);
        const data = res.data;
        
        setProduct(data);
        
        const contentToParse = data.description || data.uses || data.content || "Đang cập nhật thông tin chi tiết sản phẩm.";
        setParsedData(parseAIContent(contentToParse)); 

      } catch (error) {
        console.error("Lỗi khi gọi API chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetail();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      let currentActive = 0;
      parsedData.sections.forEach((_, idx) => {
        const element = document.getElementById(`section-${idx}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            currentActive = idx;
          }
        }
      });
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parsedData.sections]);

  const scrollToSection = (index) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // BỔ SUNG: Hàm xử lý khi Hào bấm "Thêm Vào Giỏ"
  const handleAddToCart = () => {
    // Gọi hàm addToCart N LẦN tùy theo số lượng Hào chọn
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    alert(`Đã thêm ${quantity} hộp ${product.name} vào giỏ hàng! 🛒`);
    // Thích thì cho nó bay sang trang Giỏ hàng luôn, không thì bỏ comment dòng dưới
    // navigate('/cart'); 
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Không tìm thấy sản phẩm!</h2>
      <button onClick={() => navigate('/products')} className="text-brand font-bold underline">Quay lại siêu thị</button>
    </div>
  );

  const productImageUrl = product.imageUrl || product.image_url || defaultImage;
  const productPrice = product.price || 0;
  const productOldPrice = product.oldPrice || product.old_price;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-8">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group shrink-0">
            <HeartPulse size={28} className="text-brand" />
            <span className="text-2xl font-black text-slate-900 tracking-tight">Sa<span className="text-brand">Ha</span></span>
          </div>
          
          <div className="flex-1 max-w-2xl relative group hidden md:block">
            <input type="text" placeholder="Tìm sản phẩm..." className="w-full pl-5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:ring-1 focus:ring-brand transition-all" />
            <button className="absolute right-1.5 top-1.5 bg-brand text-white p-1.5 rounded-full hover:bg-orange-600 transition-colors"><Search size={16} /></button>
          </div>

          <div className="flex gap-6 items-center shrink-0">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand transition-colors">
              <ArrowLeft size={16} /> Quay lại
            </button>
            <div onClick={() => navigate('/cart')} className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-brand transition-colors relative">
              <div className="relative">
                <ShoppingCart size={22} className="mb-0.5" />
                {/* BỔ SUNG: Hiển thị chấm đỏ giỏ hàng */}
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Giỏ hàng</span>
            </div>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-brand transition-colors">Trang chủ</span>
        <ChevronRight size={14} className="text-slate-300" />
        <span onClick={() => navigate('/products')} className="cursor-pointer hover:text-brand transition-colors">Sản phẩm</span>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-slate-800 line-clamp-1">{product.name}</span>
      </div>

      {/* THÔNG TIN CHÍNH SẢN PHẨM */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Ảnh sản phẩm */}
            <div className="lg:col-span-5 flex justify-center items-center bg-slate-50/50 rounded-2xl p-8 border border-slate-50">
              <div className="w-full max-w-[400px] aspect-square flex items-center justify-center overflow-hidden">
                <img 
                  src={productImageUrl} 
                  alt={product.name} 
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                  className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>

            {/* Thông tin mua hàng */}
            <div className="lg:col-span-7 flex flex-col justify-start pt-2">
              <div className="flex items-center gap-2 text-[11px] font-black text-brand mb-4 uppercase tracking-widest bg-orange-50 w-fit px-3 py-1.5 rounded-lg">
                <ShieldCheck size={16} /> Cam Kết Chính Hãng 100%
              </div>
              
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 leading-[1.3]">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6 text-sm">
                <div className="flex text-amber-400">
                  <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-medium">Lượt mua cao</span>
              </div>

              {/* Khu vực Giá */}
              <div className="flex items-end gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <span className="text-4xl font-black text-brand">{Number(productPrice).toLocaleString()}đ</span>
                {productOldPrice && (
                  <div className="flex flex-col mb-1">
                    <span className="text-sm text-slate-400 line-through">{Number(productOldPrice).toLocaleString()}đ</span>
                    <span className="text-xs font-bold text-rose-500 bg-rose-100 px-2 py-0.5 rounded-md w-fit">
                      Giảm {Math.round((1 - productPrice / productOldPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 items-center mt-auto">
                <div className="flex items-center border-2 border-slate-100 rounded-2xl overflow-hidden h-14 bg-white shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-5 h-full text-slate-500 hover:bg-slate-50 hover:text-brand font-black text-lg transition-colors">-</button>
                  <input type="text" value={quantity} readOnly className="w-12 text-center font-black text-slate-900 outline-none bg-transparent" />
                  <button onClick={() => setQuantity(quantity + 1)} className="px-5 h-full text-slate-500 hover:bg-slate-50 hover:text-brand font-black text-lg transition-colors">+</button>
                </div>
                
                {/* BỔ SUNG: Nút bấm Thêm Vào Giỏ Trên Máy Tính */}
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand text-white h-14 rounded-2xl font-black text-lg uppercase tracking-wider hover:bg-orange-600 transition-all shadow-xl shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-1"
                >
                  THÊM VÀO GIỎ HÀNG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CHI TIẾT SẢN PHẨM (ScrollSpy) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Menu bên trái */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-black text-slate-900 mb-6 px-2 uppercase tracking-wider text-sm border-b border-slate-100 pb-4">
                Danh mục nội dung
              </h3>
              <ul className="space-y-2">
                {parsedData.sections.map((section, idx) => (
                  <li 
                    key={idx} 
                    onClick={() => scrollToSection(idx)} 
                    className={`px-4 py-3 text-sm cursor-pointer rounded-xl transition-all duration-300 border-l-4 ${
                      activeSection === idx 
                        ? 'bg-orange-50 text-brand font-black border-brand shadow-sm' 
                        : 'border-transparent text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900' 
                    }`}
                  >
                    {section.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Nội dung bên phải */}
          <div className="lg:col-span-9 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 space-y-12">
            {parsedData.sections.length > 0 ? (
              parsedData.sections.map((section, idx) => (
                <div key={idx} id={`section-${idx}`} className="border-b border-slate-100 pb-12 last:border-0 last:pb-0 scroll-mt-28">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm">{idx + 1}</span>
                    {section.title}
                  </h2>
                  <div className="text-slate-600 text-lg leading-loose text-justify font-medium">
                    {section.content.split('\n').map((para, i) => (
                      <p key={i} className="mb-4">{para}</p>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-center py-10">Đang cập nhật nội dung chi tiết cho sản phẩm này.</p>
            )}
          </div>
        </div>
      </div>

      {/* THANH MUA HÀNG TRÊN MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 lg:hidden z-40 pb-safe">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block flex-1">
            <p className="text-sm font-bold text-slate-900 line-clamp-1">{product.name}</p>
            <p className="text-brand font-black text-lg">{Number(productPrice).toLocaleString()}đ</p>
          </div>
          {/* BỔ SUNG: Nút bấm Chọn Mua Trên Điện Thoại */}
          <button 
            onClick={handleAddToCart}
            className="w-full sm:w-auto flex-1 bg-brand text-white h-12 px-8 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-brand/30"
          >
            CHỌN MUA
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;