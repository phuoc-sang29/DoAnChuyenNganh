import React, { useState, useEffect } from 'react';
import ChatAI from './ChatAI.jsx';
import { supabase } from './services/supabase';
import { 
  Search, ShoppingCart, User, Phone, ShieldCheck, 
  ChevronRight, HeartPulse, Sparkles, MapPin, Mail, 
  Facebook, Instagram, Youtube, Clock,
  Pill, Leaf, Eye // Import thêm các Icon xịn sò
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockBlogs = [
  { id: 1, title: '5 Loại Vitamin Cần Thiết Cho Mùa Bệnh Dịch', date: '12/10/2026', img: 'https://placehold.co/600x400/e2e8f0/64748b?text=Health+Tips+1' },
  { id: 2, title: 'Cách Phân Biệt Omega 3 Thật Giả Chuẩn Nhất', date: '05/10/2026', img: 'https://placehold.co/600x400/e2e8f0/64748b?text=Health+Tips+2' },
  { id: 3, title: 'Bí Quyết Tăng Sức Đề Kháng Tự Nhiên Cho Bé', date: '28/09/2026', img: 'https://placehold.co/600x400/e2e8f0/64748b?text=Health+Tips+3' },
];

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuProducts, setMenuProducts] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      const { data: prodData } = await supabase.from('products').select(`*, categories ( name )`).limit(5);
      if (prodData) setProducts(prodData);

      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData);

      const { data: menuProdData } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(2);
      if (menuProdData) setMenuProducts(menuProdData);
    };

    fetchHomeData();
  }, []);

  const col1 = categories.slice(0, 5);
  const col2 = categories.slice(5, 10);
  const col3 = categories.slice(10, 13);

  return (
    <div className="min-h-screen bg-surface font-sans text-slate-800 selection:bg-brand selection:text-white relative">
      
      <div className="bg-brand text-white text-xs py-2 font-medium tracking-wide">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14}/> SaHa cam kết 100% hàng chính hãng</span>
          <span className="flex items-center gap-1.5"><Phone size={14}/> Hotline: 0858.433.409</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-8">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group shrink-0">
            <div className="bg-brand-light p-2 rounded-xl">
              <HeartPulse size={32} className="text-brand" />
            </div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">Sa<span className="text-brand">Ha</span></span>
          </div>
          
          <div className="flex-1 max-w-2xl relative group">
            <input type="text" placeholder="Tìm sản phẩm..." className="w-full pl-5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all text-sm" />
            <button className="absolute right-1.5 top-1.5 bg-brand text-white p-1.5 rounded-full hover:bg-brand-hover transition-colors">
              <Search size={18} />
            </button>
          </div>

          <div className="flex gap-6 items-center shrink-0">
            <div onClick={() => navigate('/login')} className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-brand transition-colors">
              <User size={22} className="mb-0.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Tài khoản</span>
            </div>
            <div onClick={() => navigate('/cart')} className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-brand transition-colors relative">
              <div className="relative">
                <ShoppingCart size={22} className="mb-0.5" />
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">0</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Giỏ hàng</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-50 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex items-center relative">
            
            <div 
              onMouseEnter={() => setIsMenuOpen(true)}
              onMouseLeave={() => setIsMenuOpen(false)}
              className="relative"
            >
              <button className="bg-brand text-white px-8 py-3 flex items-center gap-3 font-bold text-sm rounded-t-lg">
                <ChevronRight size={18} className={`transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} /> Danh mục
              </button>

              {isMenuOpen && (
                <div className="absolute top-full left-0 w-[1000px] bg-white shadow-2xl rounded-b-3xl border border-slate-100 p-8 flex gap-10 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex-1">
                    <h4 className="font-bold text-brand mb-4 pb-2 border-b border-orange-50 uppercase text-xs tracking-widest">Danh Mục 1</h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                      {col1.map(cat => (
                        <li key={cat.id} onClick={() => navigate('/products', { state: { categoryId: cat.id } })} className="hover:text-brand cursor-pointer truncate transition-colors">{cat.name}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-brand mb-4 pb-2 border-b border-orange-50 uppercase text-xs tracking-widest">Danh Mục 2</h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                      {col2.map(cat => (
                        <li key={cat.id} onClick={() => navigate('/products', { state: { categoryId: cat.id } })} className="hover:text-brand cursor-pointer truncate transition-colors">{cat.name}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-brand mb-4 pb-2 border-b border-orange-50 uppercase text-xs tracking-widest">Danh Mục 3</h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                      {col3.map(cat => (
                        <li key={cat.id} onClick={() => navigate('/products', { state: { categoryId: cat.id } })} className="hover:text-brand cursor-pointer truncate transition-colors">{cat.name}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex-1 bg-slate-50 p-4 rounded-2xl">
                    <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">Sản phẩm mới</h4>
                    <div className="space-y-4">
                      {menuProducts.map(prod => (
                        <div key={prod.id} onClick={() => navigate(`/product/${prod.id}`)} className="flex gap-3 items-center cursor-pointer group">
                          <div className="w-12 h-12 bg-white rounded-lg shrink-0 overflow-hidden border border-slate-100">
                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold leading-snug line-clamp-2 group-hover:text-brand transition-colors">{prod.name}</p>
                            <p className="text-[10px] text-brand font-black mt-1">{Number(prod.price).toLocaleString()}đ</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <nav className="flex items-center ml-10 gap-8">
              {['Sản phẩm', 'Thương hiệu', 'Xuất xứ', 'Bài viết'].map((item) => (
                <div key={item} className="group relative py-3 cursor-pointer">
                  <span className="text-sm font-bold text-slate-600 group-hover:text-brand transition-colors flex items-center gap-1">
                    {item} <ChevronRight size={14} className="rotate-90 opacity-40" />
                  </span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand group-hover:w-full transition-all duration-300"></div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-brand-light rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-brand text-xs font-bold rounded-full mb-6 shadow-sm">
              <Sparkles size={14} /> Trợ lý AI tư vấn 24/7
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
              Sức khỏe vững vàng, <br/><span className="text-brand">An tâm mỗi ngày.</span>
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Nhà thuốc SaHa cung cấp hàng ngàn sản phẩm TPCN chính hãng. Trải nghiệm tính năng hỏi đáp cùng Dược Sĩ AI thông minh nhất.
            </p>
            <button onClick={() => navigate('/products')} className="bg-brand text-white px-8 py-3.5 rounded-full font-bold hover:bg-brand-hover shadow-lg hover:shadow-brand/40 transition-all flex items-center gap-2">
              Mua sắm ngay <ChevronRight size={18} />
            </button>
          </div>
          <HeartPulse size={300} className="absolute -right-20 -bottom-20 text-orange-200 opacity-30" />
        </div>
      </div>

      {/* DANH MỤC TRUNG TÂM (Đã thay đổi Icon và Gắn Link chuyển trang) */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <h3 className="text-2xl font-black text-slate-900 mb-6">Danh Mục Chăm Sóc</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories
            .filter(cat => ['Vitamin & Khoáng chất', 'Hỗ trợ làm đẹp', 'Tiêu hóa', 'Miễn dịch & Đề kháng', 'Mắt & Thị lực'].includes(cat.name))
            .slice(0, 5)
            .map((cat) => {
              // Gán Icon Lucide tương ứng
              let IconComponent = Sparkles; 
              if (cat.name === 'Vitamin & Khoáng chất') IconComponent = Pill;
              if (cat.name === 'Tiêu hóa') IconComponent = Leaf;
              if (cat.name === 'Miễn dịch & Đề kháng') IconComponent = ShieldCheck;
              if (cat.name === 'Mắt & Thị lực') IconComponent = Eye;
              if (cat.name === 'Hỗ trợ làm đẹp') IconComponent = Sparkles;

              return (
                <div 
                  key={cat.id} 
                  // Gắn State categoryId để gửi sang trang Danh sách sản phẩm
                  onClick={() => navigate('/products', { state: { categoryId: cat.id } })} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center cursor-pointer hover:border-brand/50 hover:shadow-md transition-all group"
                >
                  <div className="mb-3 bg-slate-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center group-hover:bg-brand-light transition-colors">
                    <IconComponent size={32} className="text-slate-600 group-hover:text-brand transition-colors" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm group-hover:text-brand transition-colors">{cat.name}</p>
                </div>
              );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-black text-slate-900">Sản Phẩm Khuyên Dùng</h3>
          <button onClick={() => navigate('/products')} className="text-brand font-semibold text-sm hover:underline">Xem tất cả</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {products.map(product => (
            <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col cursor-pointer">
              <div className="relative aspect-square mb-4 rounded-xl overflow-hidden flex items-center justify-center p-2 bg-slate-50">
                {product.old_price && (
                  <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10">
                    -{Math.round((1 - product.price / product.old_price) * 100)}%
                  </span>
                )}
                <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-[10px] font-bold text-brand uppercase mb-1 line-clamp-1">{product.categories?.name}</p>
              <h4 className="font-bold text-slate-800 text-sm mb-3 flex-1 line-clamp-2">{product.name}</h4>
              <div className="flex items-end justify-between pt-3 border-t border-slate-50">
                <div>
                  <div className="text-lg font-black text-brand">{Number(product.price).toLocaleString()}đ</div>
                </div>
                <button className="bg-brand-light text-brand p-2 rounded-lg hover:bg-brand hover:text-white transition-colors">
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-20 mb-20">
        <h3 className="text-2xl font-black text-slate-900 mb-6">Góc Sức Khỏe SaHa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockBlogs.map(blog => (
            <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer group">
              <div className="overflow-hidden h-48">
                <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                  <Clock size={14} /> {blog.date}
                </div>
                <h4 className="font-bold text-slate-800 text-lg line-clamp-2 group-hover:text-brand transition-colors">{blog.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ChatAI />
    </div>
  );
};

export default App;