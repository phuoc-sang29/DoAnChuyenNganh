import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultImage = "https://placehold.co/600x400/ea580c/ffffff?text=SaHa+Pharmacy";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllBlogs = async () => {
      try {
        const res = await axios.get('http://localhost:5246/api/Blogs');
        setBlogs(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách bài viết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBlogs();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-slate-50">
      <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* THANH ĐIỀU HƯỚNG (BREADCRUMB) */}
        <div className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest mb-10 pb-4 border-b border-slate-200/60">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1.5 cursor-pointer hover:text-brand transition-colors"
          >
            <Home size={16} className="mb-0.5" />
            <span>Trang Chủ</span>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
          <span className="text-brand">Kiến thức sức khỏe</span>
        </div>

        {/* ========================================== */}
        {/* TIÊU ĐỀ TRANG ĐÃ ĐƯỢC CĂN GIỮA (CENTERED) */}
        {/* ========================================== */}
        <div className="mb-14 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Góc Sức Khỏe SaHa
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl">
            Cập nhật những kiến thức y khoa, dinh dưỡng và mẹo chăm sóc gia đình mới nhất từ đội ngũ dược sĩ của chúng tôi.
          </p>
        </div>
        
        {/* Danh sách bài viết */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <article 
              key={blog.id} 
              onClick={() => navigate(`/blogs/${blog.id}`)}
              className="flex flex-col bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100 group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-56 overflow-hidden">
                <img 
                  src={blog.imageUrl || defaultImage} 
                  alt={blog.title} 
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = defaultImage; 
                  }} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                  <Clock size={16} />
                  {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-slate-500 line-clamp-3 mb-6 flex-grow text-sm leading-relaxed">
                  {blog.content}
                </p>
                <button className="flex items-center gap-2 text-brand font-black text-sm uppercase tracking-wider mt-auto">
                  Đọc bài viết <ChevronRight size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Blogs;