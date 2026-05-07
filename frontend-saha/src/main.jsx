import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Các trang chính
import App from './App.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import ProductDetail from './ProductDetail.jsx'
import ProductPage from './ProductPage.jsx'
import Cart from './Cart.jsx'
import Checkout from './Checkout.jsx' // ĐÃ BỔ SUNG DÒNG NÀY
import Blogs from './Blogs.jsx'
import Brands from './Brands.jsx'
import Origins from './Origins.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import { CartProvider } from './CartContext';
import ChatAI from './ChatAI.jsx';
import './index.css';
import Profile from './Profile.jsx'
import OrderHistory from './OrderHistory.jsx'
import BlogDetail from './BlogDetail.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Nhớ thay MÃ_CLIENT xịn vào đây nếu bạn có xài Google Login nhé */}
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/origins" element={<Origins />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/order-history" element={<OrderHistory />} />
          </Routes>

          {/* ChatAI nằm trong BrowserRouter nhưng ngoài Routes để hiện ở mọi trang */}
          <ChatAI />
        </BrowserRouter>
      </CartProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)