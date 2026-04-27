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
import ProductPage from './ProductPage.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/products" element={<ProductPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)