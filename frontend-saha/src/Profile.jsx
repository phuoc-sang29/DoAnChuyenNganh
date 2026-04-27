import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  MapPin,
  Edit,
  ShieldCheck,
  LogOut,
  Home,
  ChevronRight,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-semibold mb-8">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-orange-500 transition"
          >
            <Home size={18} />
            Trang chủ
          </div>
          <ChevronRight size={16} className="text-slate-300" />
          <span className="text-orange-500">Hồ sơ cá nhân</span>
        </div>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100">

          {/* Cover */}
          <div className="h-44 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 relative">
            <div className="absolute right-6 top-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white text-sm font-bold">
              <ShieldCheck size={16} />
              Tài khoản xác thực
            </div>
          </div>

          <div className="px-8 pb-10 relative">

            {/* Avatar */}
            <div className="absolute -top-16 left-8">
              <div className="w-32 h-32 rounded-full bg-white p-2 shadow-xl">
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                  <User size={50} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <button className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-orange-50 hover:text-orange-500 transition font-bold text-sm flex items-center gap-2">
                <Edit size={16} />
                Chỉnh sửa
              </button>

              <button
                onClick={handleLogout}
                className="px-5 py-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition font-bold text-sm flex items-center gap-2"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>

            {/* User info */}
            <div className="mt-10">
              <h2 className="text-3xl font-black text-slate-800">
                {user.fullName || 'Chưa cập nhật tên'}
              </h2>
              <p className="text-slate-500 mt-1">@{user.username}</p>
            </div>

            {/* Contact */}
            <div className="mt-10">
              <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-5">
                Thông tin tài khoản
              </h3>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="p-5 rounded-3xl bg-slate-50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow">
                    <Mail size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                    <p className="font-semibold text-slate-700">{user.email}</p>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-slate-50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow">
                    <User size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Mã khách hàng</p>
                    <p className="font-semibold text-slate-700 truncate max-w-[220px]">
                      {user.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-5 rounded-3xl bg-orange-50 flex items-start gap-4">
                <MapPin className="text-orange-500 mt-1" size={20} />
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tính năng cập nhật <b>địa chỉ giao hàng</b> và <b>số điện thoại</b> sẽ được
                  bổ sung trong phiên bản tiếp theo để nâng cao trải nghiệm mua sắm.
                </p>
              </div>
            </div>

            {/* Order history */}
            <div className="mt-10">
              <button
                onClick={() => navigate('/order-history')}
                className="w-full bg-slate-900 hover:bg-orange-500 text-white py-5 rounded-3xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <Package size={22} />
                Xem lịch sử mua hàng
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;