import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  
  // 1. NGHIỆP VỤ CHIA TỦ ĐỒ (Phân loại người dùng)
  // Lấy thông tin user hiện tại xem có đang đăng nhập không
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Tạo tên "tủ đồ" động. Nếu có user thì gắn ID vào, không thì là guest
  const cartKey = user && user.id ? `cart_${user.id}` : 'cart_guest';

  // 2. KHỞI TẠO GIỎ HÀNG TỪ ĐÚNG TỦ ĐỒ CỦA NGƯỜI ĐÓ
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(cartKey);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 3. LƯU LẠI GIỎ HÀNG VÀO ĐÚNG TỦ KHI CÓ SỰ THAY ĐỔI
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  // Các hàm xử lý giỏ hàng (giữ nguyên logic cũ, chỉ tác động vào state 'cart')
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // Tính toán tổng tiền và số lượng
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);