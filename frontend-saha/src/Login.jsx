import React, { useState } from 'react';
import { HeartPulse, Mail, Lock, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google'; // Import thư viện Google

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const brandColor = "#ea580c"; 

  // 1. Đăng nhập bằng Email/Password bình thường
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5246/api/Auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user)); 
      alert("Đăng nhập thành công!");
      
      // Chuyển trang và TẢI LẠI TRANG ĐỂ ĐỒNG BỘ GIỎ HÀNG
      navigate('/');
      window.location.reload(); 
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Sai tài khoản hoặc mật khẩu"));
    } finally {
      setLoading(false);
    }
  };

  // 2. Logic xử lý Đăng nhập bằng Google
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Lấy thông tin user (Email, Tên, Ảnh) trực tiếp từ Google
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        // Gửi thông tin sang Backend C# (Hào nhớ tạo API này ở C# nhé)
        const res = await axios.post('http://localhost:5246/api/Auth/google-login', {
          email: userInfo.data.email,
          fullName: userInfo.data.name,
          googleId: userInfo.data.sub
        });

        // Nhận Token từ C# và cho phép vào trang chủ
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user)); 
        alert("Đăng nhập Google thành công!");
        
        // Chuyển trang và TẢI LẠI TRANG ĐỂ ĐỒNG BỘ GIỎ HÀNG
        navigate('/');
        window.location.reload();

      } catch (err) {
        console.error("Lỗi Google Login:", err);
        alert("Lỗi kết nối với máy chủ khi đăng nhập Google!");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      alert("Đăng nhập Google thất bại!");
    }
  });

  return (
    <div className="min-h-screen bg-[#fffcf9] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-[-8%] right-[-8%] w-[380px] h-[380px] rounded-full bg-orange-100/40 blur-3xl"></div>
      <div className="absolute bottom-[-8%] left-[-8%] w-[280px] h-[280px] rounded-full bg-orange-50/60 blur-3xl"></div>

      <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-all text-sm font-semibold border-none bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm cursor-pointer z-10">
        <ArrowLeft size={16} /> Trang chủ
      </button>

      <div className="w-full max-w-[400px] z-10">
        <div className="text-center mb-10">
          <div className="inline-flex bg-white p-5 rounded-[2.2rem] shadow-xl shadow-orange-100/50 mb-7 transform transition-transform hover:scale-105">
            <HeartPulse size={48} color={brandColor} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-700 tracking-tight mb-2.5">
            Mừng bạn <span style={{color: brandColor}}>trở lại!</span>
          </h2>
          <p className="text-slate-500 text-base font-medium">Đăng nhập để tiếp tục cùng SaHa</p>
        </div>

        <div className="bg-white p-9 rounded-[2.2rem] shadow-[0_15px_40px_rgba(234,88,12,0.06)] border border-white relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 font-bold tracking-widest uppercase shadow-md">
            <ShieldCheck size={12} className="text-orange-400" /> Hệ thống bảo mật
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium" />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors" size={18} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Mật khẩu</label>
            <span 
                onClick={() => navigate('/forgot-password')} 
                className="text-[11px] font-bold text-orange-400 hover:underline cursor-pointer">Quên mật khẩu?</span>
              </div>
              <div className="relative group">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors" size={18} />
              </div>
            </div>

            <button disabled={loading} className="w-full bg-brand text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-brand/20 hover:brightness-105 transition-all active:scale-[0.98] mt-3 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "ĐĂNG NHẬP"}
            </button>
          </form>

          {/* Gạch ngang */}
          <div className="mt-7 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-white px-3 text-slate-400 font-bold uppercase tracking-widest">Hoặc</span>
            </div>
          </div>

          {/* NÚT GOOGLE BẤM VÀO SẼ KÍCH HOẠT Hàm loginWithGoogle */}
          <button 
            onClick={() => loginWithGoogle()}
            type="button"
            className="w-full bg-white border-2 border-slate-100 text-slate-600 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all flex justify-center items-center gap-3 mt-6 shadow-sm active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 41.939 C -8.804 40.009 -11.514 38.899 -14.754 38.899 C -19.444 38.899 -23.494 41.599 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Tiếp tục với Google
          </button>
        </div>

        <div className="text-center mt-9">
            <p className="text-slate-500 font-medium">
                Bạn mới biết đến SaHa? 
                <span onClick={() => navigate('/register')} className="font-bold ml-1.5 cursor-pointer hover:underline text-brand">
                    Tạo tài khoản
                </span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;