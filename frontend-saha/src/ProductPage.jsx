import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronRight, ChevronLeft, Filter, SlidersHorizontal, Check,
  HeartPulse, Search, ShoppingCart, ArrowLeft, ChevronDown
} from 'lucide-react';

// BỔ SUNG: Khai báo để xài chung Giỏ Hàng
import { useCart } from './CartContext';

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const ProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [searchParams] = useSearchParams(); 

  // Kéo phép thuật Giỏ hàng ra xài
  const { addToCart, cartCount } = useCart();
  
  const brandFromUrl = searchParams.get('brand');
  const categoryFromUrl = searchParams.get('category');
  const originFromUrl = searchParams.get('origin'); 
  const searchFromUrl = searchParams.get('search'); 

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl ? parseInt(categoryFromUrl) : (location.state?.categoryId || null));
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedAudience, setSelectedAudience] = useState(null);
  
  const [selectedOrigin, setSelectedOrigin] = useState(originFromUrl || null); 
  const [selectedBrand, setSelectedBrand] = useState(brandFromUrl || null);
  
  const [searchTerm, setSearchTerm] = useState(searchFromUrl || '');
  
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9; 

  const [openFilterSections, setOpenFilterSections] = useState({
    category: true,
    audience: true,
    price: true,
    origin: originFromUrl ? true : false, 
    brand: brandFromUrl ? true : false, 
    indication: false
  });

  const toggleFilterSection = (section) => {
    setOpenFilterSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filterOptions = {
    audiences: ['Tất cả', 'Người lớn', 'Người trưởng thành', 'Trẻ em', 'Người suy gan, thận'],
    origins: ['Việt Nam', 'Mỹ', 'Úc', 'Nhật Bản', 'Pháp'],
    brands: ['DHC', 'Nature Made', 'Blackmores', 'Dược phẩm Hoa Linh', 'La Roche-Posay', 'Vichy', 'Healthy Care']
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5246/api/Products');
        const data = res.data;
        setAllProducts(data);
        
        setCategories([
          { id: 1, name: 'Vitamin & Khoáng chất' },
          { id: 2, name: 'Miễn dịch & Đề kháng' },
          { id: 3, name: 'Sinh lý & Nội tiết tố' },
          { id: 4, name: 'Mắt & Thị lực' },
          { id: 5, name: 'Tiêu hóa' },
          { id: 6, name: 'Thần kinh & Não' },
          { id: 7, name: 'Hỗ trợ làm đẹp' },
          { id: 8, name: 'Đường huyết & Tiểu đường' },
          { id: 9, name: 'Tim mạch & Huyết áp' },
          { id: 10, name: 'Hô hấp & Tai mũi họng' },
          { id: 11, name: 'Cơ xương khớp' },
          { id: 12, name: 'Gan mật' },
          { id: 13, name: 'Thận & Tiết niệu' },
        ]);
        
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchFromUrl !== null) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchFromUrl]);

  useEffect(() => {
    let result = [...allProducts];

    if (searchTerm && searchTerm.trim() !== "") {
      const searchNoTone = removeVietnameseTones(searchTerm.trim().toLowerCase());
      result = result.filter(p => {
        const nameNoTone = removeVietnameseTones(p.name?.toLowerCase());
        return nameNoTone.includes(searchNoTone);
      });
    }

    if (selectedCategory) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    if (selectedBrand) {
      result = result.filter(p => p.brand?.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (selectedOrigin) {
      result = result.filter(p => p.origin?.trim().toLowerCase() === selectedOrigin.trim().toLowerCase());
    }

    if (selectedPrice === 'under100') result = result.filter(p => p.price < 100000);
    else if (selectedPrice === '100-300') result = result.filter(p => p.price >= 100000 && p.price <= 300000);
    else if (selectedPrice === '300-500') result = result.filter(p => p.price >= 300000 && p.price <= 500000);
    else if (selectedPrice === 'over500') result = result.filter(p => p.price > 500000);

    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
    setCurrentPage(1); 
  }, [allProducts, selectedCategory, selectedPrice, selectedAudience, selectedOrigin, selectedBrand, sortOrder, searchTerm]);

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedPrice(null);
    setSelectedAudience(null);
    setSelectedOrigin(null);
    setSelectedBrand(null);
    setSearchTerm('');
    navigate('/products', { replace: true });
  };

  const renderFilterList = (list, selectedValue, setSelectedValue) => (
    <div className="px-5 pb-5 space-y-3">
      {list.map(item => (
        <div 
          key={item} 
          onClick={() => setSelectedValue(item)} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className={`w-4 h-4 rounded shadow-sm border-2 flex items-center justify-center transition-colors ${
            selectedValue === item ? 'border-brand bg-brand' : 'border-slate-300 group-hover:border-brand'
          }`}>
            <Check size={12} strokeWidth={4} className={`text-white transition-opacity ${selectedValue === item ? 'opacity-100' : 'opacity-0'}`} />
          </div>
          <span className={`text-sm transition-colors ${selectedValue === item ? 'text-slate-900 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct); 
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage); 

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-24">
      
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-8">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group shrink-0">
            <HeartPulse size={28} className="text-brand" />
            <span className="text-2xl font-black text-slate-900 tracking-tight">Sa<span className="text-brand">Ha</span></span>
          </div>
          
          <div className="flex-1 max-w-2xl relative group hidden md:block">
            <input 
              type="text" 
              placeholder="Tìm sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-5 pr-14 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:ring-1 focus:ring-brand" 
            />
            <button className="absolute right-1.5 top-1 bg-brand text-white p-1.5 rounded-full"><Search size={16} /></button>
          </div>

          <div className="flex gap-6 items-center shrink-0">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand">
              <ArrowLeft size={16} /> Quay lại
            </button>
            <div onClick={() => navigate('/cart')} className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-brand transition-colors relative">
              <div className="relative">
                <ShoppingCart size={22} className="mb-0.5" />
                {/* Đã đồng bộ số đếm giỏ hàng */}
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

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-slate-900">Trang chủ</span>
        <ChevronRight size={12} />
        <span className="text-slate-900">
          {searchFromUrl ? `Kết quả tìm kiếm: "${searchFromUrl}"` : selectedBrand ? `Thương hiệu ${selectedBrand}` : selectedOrigin ? `Xuất xứ ${selectedOrigin}` : 'Tất cả sản phẩm'}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-8">
        
        <aside className="w-full md:w-64 shrink-0">
          {/* ... (Đoạn Sidebar giữ nguyên) ... */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
            <div className="flex items-center p-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-900" />
                <h3 className="font-black text-sm text-slate-900">Bộ lọc nâng cao</h3>
              </div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <div className="border-b border-slate-100">
                <div className="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleFilterSection('category')}>
                  <h4 className="font-bold text-slate-800 text-sm">Danh mục sản phẩm</h4>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFilterSections.category ? 'rotate-180' : ''}`} />
                </div>
                {openFilterSections.category && (
                  <div className="px-5 pb-5 space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedCategory === cat.id ? 'border-brand bg-white' : 'border-slate-300 group-hover:border-brand'
                        }`}>
                          <div className={`w-2 h-2 rounded-full bg-brand transition-transform ${selectedCategory === cat.id ? 'scale-100' : 'scale-0'}`} />
                        </div>
                        <input 
                          type="radio" 
                          name="category" 
                          className="hidden" 
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(prev => prev === cat.id ? null : cat.id)}
                        />
                        <span className={`text-sm transition-colors ${selectedCategory === cat.id ? 'text-brand font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-b border-slate-100">
                <div className="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleFilterSection('audience')}>
                  <h4 className="font-bold text-slate-800 text-sm">Đối tượng sử dụng</h4>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFilterSections.audience ? 'rotate-180' : ''}`} />
                </div>
                {openFilterSections.audience && renderFilterList(filterOptions.audiences, selectedAudience, (val) => setSelectedAudience(prev => prev === val ? null : val))}
              </div>

              <div className="border-b border-slate-100">
                <div className="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleFilterSection('price')}>
                  <h4 className="font-bold text-slate-800 text-sm">Giá bán</h4>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFilterSections.price ? 'rotate-180' : ''}`} />
                </div>
                {openFilterSections.price && (
                  <div className="px-5 pb-5 flex flex-col gap-2">
                    {[
                      { id: 'under100', label: 'Dưới 100.000đ' },
                      { id: '100-300', label: '100.000đ đến 300.000đ' },
                      { id: '300-500', label: '300.000đ đến 500.000đ' },
                      { id: 'over500', label: 'Trên 500.000đ' }
                    ].map(price => (
                      <button 
                        key={price.id}
                        onClick={() => setSelectedPrice(prev => prev === price.id ? null : price.id)}
                        className={`py-2 px-3 text-sm rounded-lg border text-center transition-all ${
                          selectedPrice === price.id ? 'border-brand bg-brand/5 text-brand font-bold' : 'border-slate-200 text-slate-600 hover:border-brand hover:text-brand bg-white'
                        }`}
                      >
                        {price.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-b border-slate-100">
                <div className="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleFilterSection('origin')}>
                  <h4 className="font-bold text-slate-800 text-sm">Nước sản xuất</h4>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFilterSections.origin ? 'rotate-180' : ''}`} />
                </div>
                {openFilterSections.origin && renderFilterList(filterOptions.origins, selectedOrigin, (val) => setSelectedOrigin(prev => prev === val ? null : val))}
              </div>

              <div>
                <div className="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleFilterSection('brand')}>
                  <h4 className="font-bold text-slate-800 text-sm">Thương hiệu</h4>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFilterSections.brand ? 'rotate-180' : ''}`} />
                </div>
                {openFilterSections.brand && renderFilterList(filterOptions.brands, selectedBrand, (val) => setSelectedBrand(prev => prev === val ? null : val))}
              </div>
            </div>

            {(selectedCategory || selectedPrice || selectedAudience || selectedOrigin || selectedBrand || searchTerm) && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <button 
                  onClick={clearAllFilters} 
                  className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:border-brand hover:text-brand transition-all shadow-sm"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex justify-between items-center relative z-10">
            <p className="text-xs font-bold text-slate-500">
              Tìm thấy <span className="text-brand text-sm">{filteredProducts.length}</span> sản phẩm
            </p>
            
            <div className="relative">
              <button onClick={() => setIsSortOpen(!isSortOpen)} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                <SlidersHorizontal size={16} />
                <span>
                  {sortOrder === 'newest' && 'Mới nhất'}
                  {sortOrder === 'price-asc' && 'Giá: Thấp đến Cao'}
                  {sortOrder === 'price-desc' && 'Giá: Cao đến Thấp'}
                </span>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden py-1">
                  <div onClick={() => { setSortOrder('newest'); setIsSortOpen(false); }} className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-slate-50 ${sortOrder === 'newest' ? 'text-brand bg-brand/5' : 'text-slate-600'}`}>Mới nhất</div>
                  <div onClick={() => { setSortOrder('price-asc'); setIsSortOpen(false); }} className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-slate-50 ${sortOrder === 'price-asc' ? 'text-brand bg-brand/5' : 'text-slate-600'}`}>Giá: Thấp đến Cao</div>
                  <div onClick={() => { setSortOrder('price-desc'); setIsSortOpen(false); }} className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-slate-50 ${sortOrder === 'price-desc' ? 'text-brand bg-brand/5' : 'text-slate-600'}`}>Giá: Cao đến Thấp</div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400 flex justify-center bg-white rounded-2xl shadow-sm border border-slate-100">
              <HeartPulse size={40} className="text-brand animate-pulse" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-slate-600 font-bold text-lg mb-2">Không tìm thấy sản phẩm nào</p>
              <p className="text-slate-400 text-sm">Vui lòng thử bỏ chọn các bộ lọc hoặc tìm kiếm tên khác.</p>
              <button onClick={clearAllFilters} className="mt-6 text-brand font-bold text-sm hover:underline">Xóa tất cả bộ lọc</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map(product => {
                  // ĐÃ FIX: Sửa thành 100 để nút không bị liệt nếu Backend quên gửi stockQty
                  const stock = product.stockQty ?? 100;
                  
                  return (
                    <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 group cursor-pointer flex flex-col hover:shadow-xl hover:border-brand/30 transition-all duration-300">
                      <div className="aspect-[4/5] bg-slate-50 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center p-4">
                        {stock <= 0 && (
                          <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10 shadow-sm">Hết hàng</span>
                        )}
                        <img 
                          src={product.imageUrl || 'https://placehold.co/400x400/fff7ed/ea580c?text=SaHa+Product'} 
                          alt={product.name} 
                          className={`max-w-full max-h-full object-contain transition-transform duration-500 ${stock > 0 ? 'group-hover:scale-110' : 'opacity-60'}`} 
                        />
                        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                           <button className="bg-white text-brand px-6 py-2 rounded-full font-bold text-xs shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">Xem chi tiết</button>
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 line-clamp-1 group-hover:text-brand transition-colors">
                        {categories.find(c => c.id === product.categoryId)?.name || 'Sản phẩm'}
                      </p>
                      <h4 className="font-bold text-slate-800 text-sm mb-3 line-clamp-2 leading-snug flex-1 group-hover:text-slate-900">{product.name}</h4>
                      
                      <div className="flex items-end justify-between pt-3 border-t border-slate-50 mt-auto relative z-20">
                        <div>
                          <div className="text-lg font-black text-brand">{product.price ? product.price.toLocaleString() : '0'}đ</div>
                        </div>
                        
                        {/* ĐÃ FIX SỰ KIỆN CLICK CHUẨN */}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Ngăn văng sang trang chi tiết
                            addToCart(product);
                            alert(`Đã thêm ${product.name} vào giỏ hàng! 🛒`);
                          }}
                          disabled={stock <= 0}
                          className={`p-2 rounded-lg transition-colors ${stock > 0 ? 'bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-brand hover:text-brand disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-colors bg-white"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                      return (
                        <button 
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                            currentPage === page 
                              ? 'bg-brand text-white shadow-lg shadow-brand/30' 
                              : 'border border-slate-200 text-slate-600 hover:border-brand hover:text-brand bg-white'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                       return <span key={page} className="text-slate-400 font-bold px-1">...</span>
                    }
                    return null;
                  })}

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-brand hover:text-brand disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-colors bg-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductPage;