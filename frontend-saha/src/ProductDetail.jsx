import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import { 
  ShoppingCart, ArrowLeft, Star, ShieldCheck, 
  HeartPulse, Search, ChevronRight 
} from 'lucide-react';

const parseAIContent = (rawText) => {
  if (!rawText) return { specs: null, sections: [] };

  let specsObj = null;
  let mainText = rawText;

  const specRegex = /\[Thông số Kỹ thuật\]:\s*(\{.*?\})\n\n\[Nội dung chi tiết\]:\n/s;
  const match = rawText.match(specRegex);
  
  if (match) {
    try {
      specsObj = JSON.parse(match[1]);
    } catch (e) {
      console.error("Lỗi đọc thông số:", e);
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
      if (title.toLowerCase().includes('đối tượng')) title = 'Đối tượng sử dụng';
      if (title.toLowerCase().includes('tác dụng phụ')) title = 'Tác dụng phụ';
      if (title.toLowerCase().includes('lưu ý')) title = 'Lưu ý';

      const content = part.substring(endIdx + 5).trim();
      if (content) sections.push({ title, content });
    }
  });

  return { specs: specsObj, sections };
};


const ProductDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [parsedData, setParsedData] = useState({ specs: null, sections: [] });
  
  // === TÍNH NĂNG SCROLLSPY (Mới thêm) ===
  const [activeSection, setActiveSection] = useState(0); // Lưu vị trí mục đang đọc

  useEffect(() => {
    const fetchProductDetail = async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          ai_knowledge_base(full_content)
        `)
        .eq('id', id)
        .single(); 

      if (!error && data) {
        setProduct(data);
        
        let contentToParse = data.description || data.uses;
        if (data.ai_knowledge_base && data.ai_knowledge_base.length > 0 && data.ai_knowledge_base[0].full_content) {
             contentToParse = data.ai_knowledge_base[0].full_content;
        }

        setParsedData(parseAIContent(contentToParse)); 
      }
      setLoading(false);
    };

    if (id) fetchProductDetail();
  }, [id]);

  // === LẮNG NGHE SỰ KIỆN CUỘN CHUỘT (Mới thêm) ===
  useEffect(() => {
    const handleScroll = () => {
      let currentActive = 0;
      // Quét qua tất cả các khối nội dung
      parsedData.sections.forEach((_, idx) => {
        const element = document.getElementById(`section-${idx}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Nếu phần đỉnh của khối nội dung chạm đến gần đầu màn hình (cách khoảng 150px)
          if (rect.top <= 150) {
            currentActive = idx;
          }
        }
      });
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Dọn dẹp bộ nhớ khi chuyển trang
  }, [parsedData.sections]);

  const scrollToSection = (index) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Đang tải thông tin sản phẩm...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-rose-500">Không tìm thấy sản phẩm!</div>;

  let originDisplay = parsedData.specs?.['Nước sản xuất'] || parsedData.specs?.['Nhà sản xuất'] || parsedData.specs?.['Thương hiệu'] || product.origin;
  if (!originDisplay || originDisplay.toLowerCase().includes('chưa rõ')) {
    originDisplay = 'CAM KẾT CHÍNH HÃNG';
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-24">
      
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-8">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group shrink-0">
            <HeartPulse size={28} className="text-brand" />
            <span className="text-2xl font-black text-slate-900 tracking-tight">Sa<span className="text-brand">Ha</span></span>
          </div>
          
          <div className="flex-1 max-w-2xl relative group hidden md:block">
            <input type="text" placeholder="Tìm sản phẩm..." className="w-full pl-5 pr-14 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:ring-1 focus:ring-brand" />
            <button className="absolute right-1.5 top-1 bg-brand text-white p-1.5 rounded-full"><Search size={16} /></button>
          </div>

          <div className="flex gap-6 items-center shrink-0">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand">
              <ArrowLeft size={16} /> Quay lại
            </button>
            <div className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-brand">
              <ShoppingCart size={20} /> <span className="text-xs font-bold">Giỏ hàng</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-slate-900">Trang chủ</span>
        <ChevronRight size={12} />
        
        {product.categories?.name && (
          <>
            <span 
              onClick={() => navigate('/products')}
              className="cursor-pointer hover:text-slate-900"
            >
              {product.categories.name}
            </span>
            <ChevronRight size={12} />
          </>
        )}
        
        <span className="text-slate-900 line-clamp-1">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[350px] aspect-square flex items-center justify-center p-4">
                <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain" />
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-start pt-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-brand mb-3 uppercase tracking-widest bg-brand/5 w-fit px-2 py-1 rounded">
                <ShieldCheck size={14} /> {originDisplay}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6 text-sm">
                <div className="flex text-amber-400">
                  <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 text-sm">Đã bán 1.2k</span>
              </div>

              <div className="flex items-end gap-3 mb-6">
                <span className="text-3xl font-black text-brand">{Number(product.price).toLocaleString()}đ</span>
                {product.old_price && <span className="text-sm text-slate-400 line-through mb-1">{Number(product.old_price).toLocaleString()}đ</span>}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-sm mb-6 grid grid-cols-2 gap-4">
                {parsedData.specs ? (
                  Object.entries(parsedData.specs).slice(0, 4).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-slate-500 block mb-1 text-xs">{key}:</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div><span className="text-slate-500 block mb-1 text-xs">Quy cách:</span><span className="font-semibold">{product.specs || 'Chưa rõ'}</span></div>
                    <div><span className="text-slate-500 block mb-1 text-xs">Xuất xứ:</span><span className="font-semibold">{product.origin || 'Chưa rõ'}</span></div>
                  </>
                )}
              </div>

              <div className="flex gap-4 items-center mt-auto">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-12 bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 h-full text-slate-500 hover:bg-slate-50 font-bold">-</button>
                  <input type="text" value={quantity} readOnly className="w-10 text-center font-bold text-slate-900 outline-none bg-transparent" />
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 h-full text-slate-500 hover:bg-slate-50 font-bold">+</button>
                </div>
                <button className="flex-1 bg-brand text-white h-12 rounded-xl font-bold hover:bg-brand-hover transition-all shadow-lg shadow-brand/20">
                  CHỌN MUA
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <h3 className="font-black text-slate-900 mb-4 px-2">Nội dung bài viết</h3>
              <ul className="space-y-1">
                {parsedData.sections.map((section, idx) => (
                  <li 
                    key={idx} 
                    onClick={() => scrollToSection(idx)} 
                    // === CSS KHI ĐƯỢC CHỌN VÀ KHÔNG ĐƯỢC CHỌN ===
                    className={`px-3 py-2 text-sm cursor-pointer rounded-lg transition-all duration-300 border-l-4 ${
                      activeSection === idx 
                        ? 'bg-brand/10 text-brand font-bold border-brand' // Đang active
                        : 'border-transparent text-slate-600 font-medium hover:bg-slate-50 hover:text-brand' // Trạng thái bình thường
                    }`}
                  >
                    {section.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
            {parsedData.sections.length > 0 ? (
              parsedData.sections.map((section, idx) => (
                <div key={idx} id={`section-${idx}`} className="border-b border-slate-50 pb-8 last:border-0 last:pb-0 scroll-mt-24">
                  <h2 className="text-lg font-black text-slate-900 mb-4">{section.title}</h2>
                  <p className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">Đang cập nhật nội dung chi tiết cho sản phẩm này.</p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] p-3 lg:hidden z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block flex-1">
            <p className="text-sm font-bold text-slate-900 line-clamp-1">{product.name}</p>
            <p className="text-brand font-black">{Number(product.price).toLocaleString()}đ</p>
          </div>
          <button className="w-full sm:w-auto flex-1 bg-brand text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-brand/20">
            CHỌN MUA
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;