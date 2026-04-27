import React, { useState } from 'react';
import { Star, MessageSquare, Send, User, ChevronDown } from 'lucide-react';

const ReviewSection = () => {
  const [reviews] = useState([
    { id: 1, name: "Nguyễn Nhật Hào", rating: 5, comment: "Sản phẩm chính hãng, đóng gói rất kỹ, giao hàng nhanh!", date: "09/04/2026" },
    { id: 2, name: "Dược sĩ SaHa", rating: 4, comment: "Vitamin C này nồng độ cao, nên uống sau khi ăn no để bảo vệ dạ dày nhé.", date: "08/04/2026" }
  ]);

  return (
    <div className="max-w-4xl mx-auto mt-20 border-t border-slate-100 pt-16 pb-20">
      
      {/* 1. HEADER: Thống kê tổng quát (Gom lại 1 hàng cho gọn) */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-5xl font-black text-brand">4.8</span>
            <div className="flex text-orange-400 mt-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
          </div>
          <div className="h-12 w-[1px] bg-slate-100 hidden md:block"></div>
          <div>
            <h3 className="font-bold text-slate-800">Đánh giá trung bình</h3>
            <p className="text-sm text-slate-400 font-medium">Dựa trên 128 lượt mua từ khách hàng</p>
          </div>
        </div>
        
        <button className="bg-brand-light text-brand px-6 py-3 rounded-2xl font-black text-sm hover:bg-brand hover:text-white transition-all flex items-center gap-2">
          Viết đánh giá của bạn
        </button>
      </div>

      {/* 2. FORM: Viết nhận xét (Làm dẹt lại để không chiếm chỗ) */}
      <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 mb-12">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shrink-0 border border-slate-100">
            <User size={24} />
          </div>
          <div className="flex-1 relative">
            <textarea 
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." 
              className="w-full bg-white p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-brand/20 text-sm h-28 resize-none shadow-sm"
            />
            <button className="absolute bottom-3 right-3 bg-brand text-white p-2 rounded-xl hover:bg-brand-hover transition-all shadow-lg shadow-brand/20">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. LIST: Danh sách bình luận */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6 px-4">
          <h4 className="font-black text-slate-800 flex items-center gap-2">
            <MessageSquare size={20} className="text-brand" /> 
            Bình luận gần đây
          </h4>
          <button className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-brand">
            Mới nhất <ChevronDown size={14} />
          </button>
        </div>

        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-brand font-black text-xs uppercase border border-white">
                  {rev.name[0]}
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 text-sm leading-none mb-1">{rev.name}</h5>
                  <div className="flex items-center gap-2">
                    <div className="flex text-orange-400">
                      {[...Array(rev.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">{rev.date}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed px-1">
              {rev.comment}
            </p>
          </div>
        ))}

        <div className="text-center mt-10">
          <button className="text-slate-400 font-bold text-sm hover:text-brand transition-colors">
            Xem thêm bình luận khác...
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;