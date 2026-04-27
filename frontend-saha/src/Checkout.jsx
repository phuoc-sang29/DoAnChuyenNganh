import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, MapPin, CreditCard, ShieldCheck, 
  Truck, Package, CheckCircle2, Wallet
} from 'lucide-react';
import { useCart } from './CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();

  // Nếu khách chưa mua gì mà cố tình mò vào đây thì đuổi về trang chủ
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // State lưu thông tin khách hàng
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: ''
  });

  const safeCartTotal = Number(cartTotal) || 0;
  const shipping = safeCartTotal >= 500000 ? 0 : 30000;
  const finalTotal = safeCartTotal + shipping;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ĐÃ SỬA: Hàm xử lý chốt đơn kết nối Backend C#
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if(!formData.fullName || !formData.phone || !formData.address) {
      alert("Hào ơi, điền thiếu thông tin giao hàng kìa!");
      return;
    }

    try {
      // 1. Kéo thông tin tài khoản đang đăng nhập ra
      const currentUser = JSON.parse(localStorage.getItem('user'));

      // 2. Gói ghém dữ liệu đúng chuẩn gửi cho C#
      const orderPayload = {
        userId: currentUser ? currentUser.id : null, 
        totalAmount: finalTotal,
        shippingAddress: `Người nhận: ${formData.fullName} | SĐT: ${formData.phone} | Địa chỉ: ${formData.address} | Ghi chú: ${formData.note || 'Không'}`,
        paymentMethod: paymentMethod, // 👈 ĐIỂM ĂN TIỀN: Báo cho C# biết đang chọn COD hay VNPay
        items: cart.map(item => ({
          productId: item.id,
          qty: item.quantity,
          priceAtPurchase: item.price
        }))
      };

      // 3. Bắn sang C# qua cổng API Orders
      const response = await axios.post('http://localhost:5246/api/Orders', orderPayload);

      if(response.status === 200 || response.status === 201) {
        // Hủy giỏ hàng ngay khi tạo đơn thành công trên DB
        clearCart(); 

        // 👈 BẮT ĐẦU LUỒNG KIỂM TRA CHUYỂN HƯỚNG VNPAY
        if (response.data.paymentUrl && response.data.paymentUrl !== "") {
          // Khách chọn VNPay -> Đá thẳng qua cổng thanh toán VNPay
          window.location.href = response.data.paymentUrl;
        } else {
          // Khách chọn COD -> Báo thành công và đá về trang Lịch sử đơn hàng
          alert("🎉 ĐẶT HÀNG THÀNH CÔNG! Đơn hàng của bạn đã được ghi nhận vào hệ thống.");
          navigate('/order-history');
        }
      }
    } catch (error) {
      const realError = error.response?.data?.error || error.response?.data?.message || "Lỗi không xác định từ Database";
      console.error("Lỗi chi tiết từ Server:", error.response?.data);
      alert("❌ Bị Database từ chối rồi sếp ơi! Lý do: " + realError);
    }
  };

  if (cart.length === 0) return null; 

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
      {/* HEADER YẾU TỐ TIN TƯỞNG */}
      <header className="bg-white border-b border-slate-100 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
            <span className="text-2xl font-black text-slate-900 tracking-tight">Sa<span className="text-orange-500">Ha</span></span>
            <span className="text-slate-300 text-2xl font-light">|</span>
            <span className="text-lg font-bold text-slate-600 tracking-wide">Thanh toán an toàn</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-full">
            <ShieldCheck size={18} /> Bảo mật SSL
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors font-bold text-sm mb-8">
          <ArrowLeft size={18} /> Quay lại giỏ hàng
        </button>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG & THANH TOÁN */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Box 1: Địa chỉ */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><MapPin size={20} /></span>
                Thông tin nhận hàng
              </h2>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên *</label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Nhập họ tên người nhận" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="VD: 0912 345 678" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ nhận hàng cụ thể *</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ghi chú cho shipper (Tùy chọn)</label>
                  <textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="VD: Giao hàng vào giờ hành chính..." rows="3" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all resize-none"></textarea>
                </div>
              </div>
            </div>

            {/* Box 2: Phương thức thanh toán */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><CreditCard size={20} /></span>
                Phương thức thanh toán
              </h2>
              
              <div className="space-y-4">
                <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-200'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-orange-500' : 'border-slate-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                  </div>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-sm text-slate-500">Khách hàng kiểm tra rồi mới thanh toán tiền mặt cho shipper.</span>
                  </div>
                  <Wallet size={28} className="ml-auto text-slate-400" />
                </label>

                <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'banking' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-200'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'banking' ? 'border-orange-500' : 'border-slate-300'}`}>
                    {paymentMethod === 'banking' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                  </div>
                  <input type="radio" name="payment" value="banking" checked={paymentMethod === 'banking'} onChange={() => setPaymentMethod('banking')} className="hidden" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">Chuyển khoản ngân hàng / VNPay</span>
                    <span className="text-sm text-slate-500">Hệ thống sẽ chuyển hướng bạn đến cổng thanh toán bảo mật.</span>
                  </div>
                  <CreditCard size={28} className="ml-auto text-slate-400" />
                </label>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[32px] shadow-lg border border-slate-100 sticky top-24">
              <h2 className="text-xl font-black mb-6">Đơn hàng của bạn</h2>
              
              {/* Danh sách món ăn rút gọn */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative">
                      <img src={item.imageUrl || 'https://placehold.co/100'} alt={item.name} className="w-16 h-16 rounded-xl border border-slate-100 object-cover" />
                      <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-orange-500 font-black mt-1">{(Number(item.price) * item.quantity).toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tính tiền */}
              <div className="space-y-3 pt-6 border-t border-slate-100 mb-6">
                <div className="flex justify-between text-slate-600 text-sm">
                  <span className="flex items-center gap-2"><Package size={16}/> Tạm tính</span>
                  <span className="font-bold">{safeCartTotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span className="flex items-center gap-2"><Truck size={16}/> Phí vận chuyển</span>
                  <span className="font-bold">{shipping === 0 ? <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">Miễn phí</span> : `${shipping.toLocaleString()}đ`}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mb-8 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800">Tổng cộng</span>
                <span className="text-3xl font-black text-orange-500">{finalTotal.toLocaleString()}đ</span>
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-orange-500 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-colors shadow-xl active:scale-[0.98]">
                <CheckCircle2 size={24} /> ĐẶT HÀNG NGAY
              </button>
              
              <p className="text-center text-[11px] text-slate-400 mt-6 px-4 leading-relaxed">
                Xin lưu ý, các sản phẩm là thuốc kê đơn sẽ cần sự tư vấn trực tiếp từ dược sĩ trước khi giao hàng.
              </p>
            </div>
          </div>
          
        </form>
      </main>
    </div>
  );
};

export default Checkout;