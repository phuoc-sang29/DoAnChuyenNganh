import React, { useState } from 'react';
import { HeartPulse, Mail, Lock, User, Phone, ArrowLeft, Loader2, ShieldPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);

  // Màu cam chủ đạo của SaHa
  const brandColor = "#ea580c"; 

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Lỗi: Mật khẩu xác nhận không khớp nhau!");
      return;
    }

    setLoading(true);
    try {
      const emailPrefix = formData.email.split('@')[0];
      const generatedUsername = `${emailPrefix}_${Math.floor(Math.random() * 1000)}`;

      const payload = {
        Username: generatedUsername,
        Email: formData.email,
        Password: formData.password,
        FullName: formData.fullName,
      };

      const res = await axios.post('http://localhost:5246/api/Auth/register', payload);

      alert(res.data.message || "Đăng ký thành công!");
      navigate('/login');
      
    } catch (err) {
      alert("Lỗi đăng ký: " + (err.response?.data?.message || "Vui lòng thử lại sau."));
    } finally {
      setLoading(false);
    }
  };

  return (
    // Nền trắng kem ấm áp
    <div className="min-h-screen bg-[#fffcf9] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Hiệu ứng nền nhẹ nhàng (Gradient Blobs màu cam) */}
      <div className="absolute top-[-5%] left-[-5%] w-[420px] h-[420px] rounded-full bg-orange-100/40 blur-3xl"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[350px] h-[350px] rounded-full bg-orange-50/60 blur-3xl"></div>

      {/* Nút quay lại */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-all text-sm font-semibold border-none bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm cursor-pointer z-10"
      >
        <ArrowLeft size={16} /> Trang chủ
      </button>

      <div className="w-full max-w-[440px] z-10 my-8">
        
        {/* HEADER */}
        <div className="text-center mb-9">
          <div className="inline-flex bg-white p-5 rounded-[2.2rem] shadow-xl shadow-orange-100/50 mb-6 transform transition-transform hover:scale-105">
            <HeartPulse size={48} color={brandColor} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-700 tracking-tight mb-2.5">
            Gia nhập <span style={{color: brandColor}}>SaHa</span>
          </h2>
          <p className="text-slate-500 text-base font-medium">Khởi đầu hành trình chăm sóc sức khỏe</p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white p-9 rounded-[2.2rem] shadow-[0_15px_40px_rgba(234,88,12,0.06)] border border-white relative">
          
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-bold tracking-widest uppercase shadow-md">
            <ShieldPlus size={12} className="text-orange-400" /> Đăng ký bảo mật
          </div>

          <form className="space-y-4.5" onSubmit={handleRegister}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Họ tên */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Họ và Tên</label>
                <div className="relative group">
                  <input 
                    type="text" required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Nhật Hào" 
                    className="w-full pl-11 pr-3 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors" size={18} />
                </div>
              </div>

              {/* SĐT */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Điện thoại</label>
                <div className="relative group">
                  <input 
                    type="tel" required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0858..." 
                    className="w-full pl-11 pr-3 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium"
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors" size={18} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Địa chỉ Email</label>
              <div className="relative group">
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="hao@example.com" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors" size={18} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative group">
                <input 
                  type="password" required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors" size={18} />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
              <div className="relative group">
                <input 
                  type="password" required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors" size={18} />
              </div>
            </div>

            {/* Nút bấm */}
            <button 
              disabled={loading}
              className="w-full bg-brand text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-brand/20 hover:brightness-105 transition-all active:scale-[0.98] mt-5 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "TẠO TÀI KHOẢN NGAY"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-9">
          <p className="text-slate-500 font-medium">
            Đã có tài khoản SaHa? 
            <span 
              onClick={() => navigate('/login')} 
              className="font-bold ml-1.5 cursor-pointer hover:underline text-brand"
            >
              Đăng nhập ngay
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;