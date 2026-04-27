import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock, Home, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        navigate('/login'); // Chưa đăng nhập thì đuổi về trang Login
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5246/api/Orders/${currentUser.id}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Lỗi lấy đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto mt-10">
        
        {/* ĐÃ SỬA: Breadcrumb điều hướng giống hệt trang Profile */}
        <div className="flex items-center flex-wrap gap-2 text-sm font-semibold mb-8">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-orange-500 transition"
          >
            <Home size={18} />
            Trang chủ
          </div>
          <ChevronRight size={16} className="text-slate-300" />
          <div
            onClick={() => navigate('/profile')}
            className="cursor-pointer text-slate-500 hover:text-orange-500 transition"
          >
            Hồ sơ cá nhân
          </div>
          <ChevronRight size={16} className="text-slate-300" />
          <span className="text-orange-500">Lịch sử đơn hàng</span>
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <Package className="text-orange-500" size={32} /> Lịch sử đơn hàng
        </h2>

        {loading ? (
          <div className="text-center text-slate-500 py-10 font-bold">Đang tải dữ liệu...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl shadow-sm text-center border border-slate-100">
            <p className="text-slate-500 font-medium mb-4">Bạn chưa có đơn hàng nào.</p>
            <button onClick={() => navigate('/')} className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-600 transition-colors">
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-lg text-sm">
                      Đơn #{index + 1}
                    </span>
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <Clock size={14}/> {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <span className="bg-orange-50 text-orange-600 font-bold px-4 py-1.5 rounded-full text-sm flex items-center gap-2 uppercase tracking-wider">
                    <Truck size={16} /> {order.status === 'pending' ? 'Đang xử lý' : order.status}
                  </span>
                </div>
                
                <div className="text-slate-600 text-sm mb-4">
                  <p className="font-bold text-slate-800 mb-1">Địa chỉ giao hàng:</p>
                  <p className="leading-relaxed">{order.shippingAddress}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <span className="text-slate-500 font-medium">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-orange-500">{order.totalAmount.toLocaleString()}đ</span>
                </div>
              </div>
            ))}
          </div>
        )} 
      </div>
    </div>
  );
};

export default OrderHistory;