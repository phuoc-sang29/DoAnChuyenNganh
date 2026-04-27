import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Receipt,
  BadgePercent,
  Package
} from 'lucide-react';
import { useCart } from './CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const safeCartTotal = Number(cartTotal) || 0;
  const shipping = safeCartTotal >= 500000 ? 0 : 30000;
  const finalTotal = safeCartTotal + shipping;
  const freeShipProgress = Math.min((safeCartTotal / 500000) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-slate-50 pb-20">
      {/* header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
              <HeartPulse className="text-orange-500 group-hover:scale-110 transition" size={24} />
            </div>
            <span className="text-2xl font-black">SaHa Health</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 font-bold">
            <ShoppingBag size={18} />
            Giỏ hàng của bạn
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition mb-8 font-semibold"
        >
          <ArrowLeft size={18} />
          Tiếp tục mua sắm
        </button>

        {cart.length === 0 ? (
          <div className="bg-white rounded-[40px] p-16 text-center shadow-xl border border-slate-100">
            <div className="w-28 h-28 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-orange-400" />
            </div>
            <h2 className="text-3xl font-black mb-3">Giỏ hàng đang trống</h2>
            <p className="text-slate-500 mb-8">
              Bạn chưa thêm sản phẩm nào vào giỏ hàng.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* left */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map(item => {
                const itemPrice = Number(item.price) || 0;
                const qty = Number(item.quantity) || 1;
                const subtotal = itemPrice * qty;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[32px] p-6 shadow-lg border border-slate-100 hover:shadow-xl transition"
                  >
                    <div className="flex gap-5">
                      <img
                        src={item.imageUrl || `https://placehold.co/100x100`}
                        alt={item.name}
                        className="w-24 h-24 rounded-2xl object-cover border"
                      />

                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">
                          {item.name}
                        </h3>

                        <div className="flex items-center gap-2 text-orange-500 font-black text-xl">
                          <Receipt size={18} />
                          {subtotal.toLocaleString()}đ
                        </div>

                        {qty > 1 && (
                          <p className="text-sm text-slate-400 mt-1">
                            {itemPrice.toLocaleString()}đ / sản phẩm
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-300 hover:text-red-500 p-3 rounded-xl hover:bg-red-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="mt-5 flex justify-between items-center">
                      <div className="flex items-center border rounded-2xl bg-slate-50 px-2 py-1">
                        <button
                          // ĐÃ SỬA: Bấm trừ sẽ giảm 1 (nếu đang là 1 thì xóa luôn)
                          onClick={() => qty > 1 ? updateQuantity(item.id, qty - 1) : removeFromCart(item.id)}
                          className="p-2 hover:text-orange-500"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="w-10 text-center font-bold">
                          {qty}
                        </span>

                        <button
                          // ĐÃ SỬA: Bấm cộng sẽ tăng 1
                          onClick={() => updateQuantity(item.id, qty + 1)}
                          className="p-2 hover:text-orange-500"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                        <ShieldCheck size={16} />
                        Chính hãng 100%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* right */}
            <div>
              <div className="bg-white rounded-[36px] p-8 shadow-xl border border-slate-100 sticky top-24">
                <h3 className="text-2xl font-black mb-6">
                  Tóm tắt đơn hàng
                </h3>

                {/* freeship */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Tiến trình freeship</span>
                    <span className="font-bold">{Math.round(freeShipProgress)}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${freeShipProgress}%` }}
                    />
                  </div>

                  {shipping > 0 && (
                    <p className="text-xs text-orange-500 mt-2 font-semibold">
                      Mua thêm {(500000 - safeCartTotal).toLocaleString()}đ để miễn phí vận chuyển
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <Package size={16} />
                      Tạm tính
                    </span>
                    <span>{safeCartTotal.toLocaleString()}đ</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <Truck size={16} />
                      Vận chuyển
                    </span>
                    <span>
                      {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString()}đ`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <BadgePercent size={16} />
                      Ưu đãi
                    </span>
                    <span>0đ</span>
                  </div>
                </div>

                <div className="border-t pt-5 flex justify-between items-center mb-8">
                  <span className="text-lg font-bold">Tổng cộng</span>
                  <span className="text-3xl font-black text-orange-500">
                    {finalTotal.toLocaleString()}đ
                  </span>
                </div>

               <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-slate-900 hover:bg-orange-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
                >
                  <CreditCard size={20} />
                    Thanh toán ngay
              </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;