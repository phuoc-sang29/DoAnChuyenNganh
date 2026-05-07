import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google' // Bổ sung import của Google

// Các trang chính
import App from './App.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import ProductDetail from './ProductDetail.jsx'
import ProductPage from './ProductPage.jsx'
import Cart from './Cart.jsx'
import Blogs from './Blogs.jsx'
import Brands from './Brands.jsx'
import Origins from './Origins.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import { CartProvider } from './CartContext';
import ChatAI from './ChatAI.jsx';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="MÃ_CLIENT_CỦA_BẠN_NẾU_CÓ">

      {/* BẮT BUỘC PHẢI CÓ THẺ NÀY BỌC BÊN NGOÀI */}
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductPage />} />
            {/* ... các Route khác của bạn cứ giữ nguyên */}
          </Routes>

          {/* ChatAI nằm trong BrowserRouter nhưng ngoài Routes */}
          <ChatAI />

        </BrowserRouter>
      </CartProvider>

    </GoogleOAuthProvider>
  </React.StrictMode>
)