import React, { useState } from 'react';
import { HeartPulse, Mail, Lock, ArrowLeft, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // Quản lý các bước: 1 (Nhập Email), 2 (Nhập OTP & Pass mới)
  const [step, setStep] = useState(1); 
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const brandColor = "#ea580c"; 

  // Xử lý gửi OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi API C# yêu cầu gửi mã OTP (Mình sẽ viết Backend sau)
      await axios.post('http://localhost:5246/api/Auth/forgot-password', { email });
      
      alert("Mã xác nhận đã được gửi đến email của bạn!");
      setStep(2); // Chuyển sang bước 2
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không tìm thấy email này trong hệ thống."));
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi API C# xác nhận OTP và lưu mật khẩu mới
      await axios.post('http://localhost:5246/api/Auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });

      alert("Khôi phục mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate('/login');
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Mã xác nhận không đúng hoặc đã hết hạn."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcf9] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Hiệu ứng nền */}
      <div className="absolute top-[-8%] right-[-8%] w-[380px] h-[380px] rounded-full bg-orange-100/40 blur-3xl"></div>
      <div className="absolute bottom-[-8%] left-[-8%] w-[280px] h-[280px] rounded-full bg-orange-50/60 blur-3xl"></div>

      <button 
        onClick={() => navigate('/login')} 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-all text-sm font-semibold border-none bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm cursor-pointer z-10"
      >
        <ArrowLeft size={16} /> Quay lại Đăng nhập
      </button>

      <div className="w-full max-w-[400px] z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex bg-white p-5 rounded-[2.2rem] shadow-xl shadow-orange-100/50 mb-7 transform transition-transform hover:scale-105">
            <HeartPulse size={48} color={brandColor} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-700 tracking-tight mb-2.5">
            Khôi phục <span style={{color: brandColor}}>Mật khẩu</span>
          </h2>
          <p className="text-slate-500 text-base font-medium">
            {step === 1 ? "Nhập email để nhận mã xác nhận" : "Nhập mã xác nhận và mật khẩu mới"}
          </p>
        </div>

        <div className="bg-white p-9 rounded-[2.2rem] shadow-[0_15px_40px_rgba(234,88,12,0.06)] border border-white relative">
            
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 font-bold tracking-widest uppercase shadow-md">
            <ShieldCheck size={12} className="text-orange-400" /> Hệ thống bảo mật
          </div>

          {/* BƯỚC 1: NHẬP EMAIL */}
          {step === 1 && (
            <form className="space-y-5" onSubmit={handleSendOTP}>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email đã đăng ký</label>
                <div className="relative group">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com" 
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors" size={18} />
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-brand text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-brand/20 hover:brightness-105 transition-all active:scale-[0.98] mt-3 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "GỬI MÃ XÁC NHẬN"}
              </button>
            </form>
          )}

          {/* BƯỚC 2: NHẬP MÃ OTP VÀ ĐỔI PASS */}
          {step === 2 && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div className="p-3 bg-orange-50 rounded-xl text-center mb-4 border border-orange-100">
                <p className="text-xs text-orange-600 font-medium">Mã đã được gửi tới <span className="font-bold">{email}</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mã xác nhận (OTP)</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Ví dụ: 123456" 
                    required
                    maxLength={6}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-bold tracking-widest"
                  />
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors" size={18} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                <div className="relative group">
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••" 
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors" size={18} />
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-brand text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-brand/20 hover:brightness-105 transition-all active:scale-[0.98] mt-3 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "XÁC NHẬN ĐỔI MẬT KHẨU"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;