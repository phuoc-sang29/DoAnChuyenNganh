import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  ChevronRight,
  Globe2,
  MapPin,
  Search,
  Package,
  ArrowRight
} from 'lucide-react';

// BỔ SUNG: Hàm lột dấu tiếng Việt chuẩn
const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const Origins = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [nations, setNations] = useState([]);

  const countryMeta = {
    'Nhật Bản': {
      id: 'Japan',
      detail: 'Tiêu chuẩn chất lượng khắt khe và công nghệ tiên tiến hàng đầu.',
      icon: '🇯🇵'
    },
    'Úc': {
      id: 'Australia',
      detail: 'Nguồn nguyên liệu thiên nhiên tinh khiết và an toàn.',
      icon: '🇦🇺'
    },
    'Mỹ': {
      id: 'USA',
      detail: 'Công nghệ nghiên cứu và sản xuất hiện đại.',
      icon: '🇺🇸'
    },
    'Pháp': {
      id: 'France',
      detail: 'Nổi tiếng về dược mỹ phẩm và chăm sóc da.',
      icon: '🇫🇷'
    },
    'Việt Nam': {
      id: 'Vietnam',
      detail: 'Thảo dược quý từ thiên nhiên trong nước.',
      icon: '🇻🇳'
    }
  };

  useEffect(() => {
    const fetchOrigins = async () => {
      try {
        const res = await axios.get('http://localhost:5246/api/Products');
        const products = res.data;

        const groupedOrigins = {};

        products.forEach(product => {
          const originName = product.origin?.trim();
          if (!originName) return;

          groupedOrigins[originName] = (groupedOrigins[originName] || 0) + 1;
        });

        const dynamicOrigins = Object.keys(groupedOrigins).map(originName => ({
          name: originName,
          products: groupedOrigins[originName],
          ...(countryMeta[originName] || {
            id: originName,
            detail: 'Nguồn gốc rõ ràng và được kiểm định chất lượng.',
            icon: '🌍'
          })
        }));

        setNations(dynamicOrigins);
      } catch (error) {
        console.error('Lỗi tải xuất xứ:', error);
      }
    };

    fetchOrigins();
  }, []);

  // CẢI TIẾN: Lọc quốc gia không phân biệt dấu
  const filtered = nations.filter(item => {
    const searchNoTone = removeVietnameseTones(search.trim().toLowerCase());
    const nameNoTone = removeVietnameseTones(item.name.toLowerCase());
    const detailNoTone = removeVietnameseTones(item.detail.toLowerCase());

    return nameNoTone.includes(searchNoTone) || detailNoTone.includes(searchNoTone);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* breadcrumb */}
        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider mb-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-700 hover:text-orange-500 transition"
          >
            <Home size={18} />
            Trang chủ
          </button>
          <ChevronRight size={16} className="text-slate-300" />
          <span className="text-orange-500">Xuất xứ sản phẩm</span>
        </div>

        {/* hero */}
        <div className="bg-white rounded-[40px] shadow-xl border border-blue-100 p-8 md:p-12 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-600 px-5 py-3 rounded-2xl mb-5">
                <Globe2 size={24} />
                <span className="font-bold">Nguồn gốc chính hãng</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Xuất xứ sản phẩm
              </h1>

              <p className="text-slate-500 text-lg max-w-2xl">
                Tất cả sản phẩm đều có nguồn gốc rõ ràng từ những quốc gia
                nổi tiếng về chăm sóc sức khỏe và dược phẩm trên thế giới.
              </p>
            </div>

            {/* search */}
            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-4 inset-y-0 my-auto text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm quốc gia (VD: Nhat ban, My)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                // BỔ SUNG: Bấm Enter để bay sang trang sản phẩm
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/products?search=${search}`);
                }}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((country) => (
            <div
              key={country.id}
              onClick={() => navigate(`/products?origin=${country.name}`)}
              className="group bg-white rounded-[32px] p-8 border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              {/* top */}
              <div className="flex justify-between items-start mb-6">
                <div className="text-6xl group-hover:scale-110 transition">
                  {country.icon}
                </div>

                <div className="bg-blue-50 p-3 rounded-2xl text-blue-500">
                  <MapPin size={18} />
                </div>
              </div>

              {/* content */}
              <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-orange-500 transition">
                {country.name}
              </h3>

              <p className="text-slate-500 leading-relaxed mb-6">
                {country.detail}
              </p>

              <div className="flex items-center gap-3 text-slate-600 text-sm mb-8">
                <Package size={16} className="text-blue-500" />
                <span>{country.products} sản phẩm</span>
              </div>

              {/* footer */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-orange-500">
                  Xem sản phẩm
                </span>
                <ArrowRight
                  size={18}
                  className="text-orange-500 group-hover:translate-x-2 transition"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Origins;