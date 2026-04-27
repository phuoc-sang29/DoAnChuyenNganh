import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  ChevronRight,
  Clock,
  User,
  Share2,
  Tag
} from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // HÀM XỬ LÝ CHIA SẺ BÀI VIẾT
  const handleShare = async () => {
    const shareData = {
      title: blog?.title,
      text: 'Đọc bài viết thú vị này trên SaHa Pharmacy nhé!',
      url: window.location.href, // Tự động lấy đường link hiện tại trên trình duyệt
    };

    try {
      if (navigator.share) {
        // Dùng API chia sẻ bản địa của thiết bị (Mobile/Tablet)
        await navigator.share(shareData);
      } else {
        // Nếu dùng trên PC không hỗ trợ, thì tự động Copy link
        await navigator.clipboard.writeText(window.location.href);
        alert('Đã copy link bài viết! Bạn có thể dán (Ctrl+V) để gửi cho bạn bè nhé.');
      }
    } catch (err) {
      console.log('Đã hủy chia sẻ hoặc có lỗi:', err);
    }
  };
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultImage =
    "https://placehold.co/1400x800/f97316/ffffff?text=SaHa+Health";

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5246/api/Blogs/${id}`);
        setBlog(res.data);
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-32">
        <h2 className="text-3xl font-bold">Không tìm thấy bài viết</h2>
      </div>
    );
  }

  const paragraphs = blog.content
    ? blog.content.split("\n").filter(p => p.trim() !== "")
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* BREADCRUMB (THANH ĐIỀU HƯỚNG) - CHUẨN DESIGN */}
        <div className="flex items-center gap-3 text-[13px] md:text-[15px] font-black uppercase tracking-widest mb-10">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-slate-900 hover:text-orange-500 transition-colors"
          >
            <Home size={18} strokeWidth={2.5} className="mb-[2px]" />
            Trang chủ
          </button>
          
          <ChevronRight size={16} className="text-slate-300" strokeWidth={3} />
          
          <button 
            onClick={() => navigate('/blogs')} 
            className="text-orange-500 hover:text-orange-600 transition-colors"
          >
            Kiến thức sức khỏe
          </button>
        </div>

        {/* hero image */}
        <div className="rounded-[40px] overflow-hidden shadow-2xl mb-10 bg-white">
          <img
            src={blog.imageUrl || defaultImage}
            alt={blog.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
            className="w-full h-[320px] md:h-[520px] object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* main content */}
          <div className="lg:col-span-8">
            <span className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
              Kiến thức sức khỏe
            </span>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
              {blog.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-slate-500 text-sm border-b border-slate-200 pb-6 mb-10">
              <div className="flex items-center gap-2">
                <User size={16} />
                Dược sĩ SaHa
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
              </div>
              <div onClick={handleShare} className="flex items-center gap-2 cursor-pointer hover:text-orange-500 transition-colors">
                <Share2 size={16} />
                Chia sẻ
              </div>
            </div>

            <div className="space-y-8 text-slate-700 text-[18px] leading-9">
              {paragraphs.map((para, index) => (
                <p key={index} className="text-justify">
                  {index === 0 ? (
                    <>
                      <span className="float-left text-7xl font-black text-orange-500 leading-none pr-4 mt-2">
                        {para.charAt(0)}
                      </span>
                      {para.substring(1)}
                    </>
                  ) : (
                    para
                  )}
                </p>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-12 pt-8 border-t border-slate-200">
              <span className="flex items-center gap-2 text-slate-500">
                <Tag size={16} />
              </span>
              <span className="px-4 py-2 rounded-full bg-orange-50 text-orange-600 font-medium text-sm hover:bg-orange-100 cursor-pointer transition-colors">
                #SứcKhỏe
              </span>
              <span className="px-4 py-2 rounded-full bg-orange-50 text-orange-600 font-medium text-sm hover:bg-orange-100 cursor-pointer transition-colors">
                #NhàThuốc
              </span>
              <span className="px-4 py-2 rounded-full bg-orange-50 text-orange-600 font-medium text-sm hover:bg-orange-100 cursor-pointer transition-colors">
                #SaHa
              </span>
            </div>
          </div>

          {/* sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl bg-white shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
              <h3 className="text-xl font-black mb-6 text-slate-900 border-b border-slate-100 pb-4">
                Thông tin bài viết
              </h3>

              <div className="space-y-5 text-slate-600">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tác giả</p>
                  <p className="font-bold text-slate-800">Dược sĩ SaHa</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày đăng</p>
                  <p className="font-bold text-slate-800">
                    {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chuyên mục</p>
                  <p className="font-bold text-slate-800">Kiến thức sức khỏe</p>
                </div>
              </div>

              <button 
                onClick={handleShare} 
                className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-2xl font-black tracking-wide shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                CHIA SẺ BÀI VIẾT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;