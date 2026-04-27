import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  ChevronRight,
  Award,
  Search,
  Globe,
  Package,
  ArrowRight
} from 'lucide-react';

// BỔ SUNG: Hàm "lột dấu" tiếng Việt siêu chuẩn
const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const Brands = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState([]);

  const brandMeta = {
    Blackmores: {
      country: 'Úc',
      logo: 'BM',
      desc: 'Thực phẩm chức năng nổi tiếng từ Úc'
    },
    DHC: {
      country: 'Nhật Bản',
      logo: 'DHC',
      desc: 'Chăm sóc sức khỏe và sắc đẹp'
    },
    'Nature Made': {
      country: 'Mỹ',
      logo: 'NM',
      desc: 'Vitamin và khoáng chất cao cấp'
    },
    'Healthy Care': {
      country: 'Úc',
      logo: 'HC',
      desc: 'Bổ sung dinh dưỡng toàn diện'
    },
    'La Roche-Posay': {
      country: 'Pháp',
      logo: 'LRP',
      desc: 'Dược mỹ phẩm cho da nhạy cảm'
    },
    Vichy: {
      country: 'Pháp',
      logo: 'VC',
      desc: 'Mỹ phẩm khoáng thiên nhiên'
    }
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get('http://localhost:5246/api/Products');
        const products = res.data;

        const groupedBrands = {};

        products.forEach(product => {
          const brandName = product.brand?.trim();
          if (!brandName) return;

          groupedBrands[brandName] = (groupedBrands[brandName] || 0) + 1;
        });

        const dynamicBrands = Object.keys(groupedBrands).map(brandName => ({
          name: brandName,
          products: groupedBrands[brandName],
          ...(brandMeta[brandName] || {
            country: 'Không xác định',
            logo: brandName.slice(0, 2).toUpperCase(),
            desc: 'Thương hiệu chăm sóc sức khỏe chất lượng cao'
          })
        }));

        setBrands(dynamicBrands);
      } catch (error) {
        console.error('Lỗi tải thương hiệu:', error);
      }
    };

    fetchBrands();
  }, []);

  // CẢI TIẾN LỌC: Tìm không dấu, quét luôn cả Tên hãng, Quốc gia và Mô tả
  const filteredBrands = brands.filter(brand => {
    const searchNoTone = removeVietnameseTones(search.trim().toLowerCase());
    const nameNoTone = removeVietnameseTones(brand.name.toLowerCase());
    const countryNoTone = removeVietnameseTones(brand.country.toLowerCase());
    const descNoTone = removeVietnameseTones(brand.desc.toLowerCase());

    // Chỉ cần khách gõ dính vào 1 trong 3 yếu tố này là lôi ra hết
    return nameNoTone.includes(searchNoTone) || 
           countryNoTone.includes(searchNoTone) || 
           descNoTone.includes(searchNoTone);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-slate-50 pb-24">
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
          <span className="text-orange-500">Thương hiệu</span>
        </div>

        {/* hero */}
        <div className="bg-white rounded-[40px] shadow-xl border border-orange-100 p-8 md:p-12 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-3 bg-orange-50 text-orange-500 px-5 py-3 rounded-2xl mb-5">
                <Award size={24} />
                <span className="font-bold">Đối tác uy tín</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Thương hiệu nổi bật
              </h1>

              <p className="text-slate-500 text-lg max-w-2xl">
                Khám phá các thương hiệu chăm sóc sức khỏe và dược phẩm
                hàng đầu thế giới được phân phối tại SaHa Health.
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
                placeholder="Tìm tên, quốc gia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-orange-400"
              />
            </div>
          </div>
        </div>

        {/* brands */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBrands.map((brand) => (
            <div
              key={brand.name}
              onClick={() => navigate(`/products?brand=${brand.name}`)}
              className="group bg-white rounded-[32px] p-8 border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              {/* top */}
              <div className="flex justify-between items-start mb-6">
                <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-500 text-2xl font-black group-hover:scale-110 transition">
                  {brand.logo}
                </div>

                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                  Popular
                </span>
              </div>

              {/* content */}
              <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-orange-500 transition">
                {brand.name}
              </h3>

              <p className="text-slate-500 mb-6 leading-relaxed">
                {brand.desc}
              </p>

              {/* info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Globe size={16} className="text-orange-400" />
                  <span>{brand.country}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <Package size={16} className="text-orange-400" />
                  <span>{brand.products} sản phẩm</span>
                </div>
              </div>

              {/* footer */}
              <div className="mt-8 flex items-center justify-between">
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

export default Brands;