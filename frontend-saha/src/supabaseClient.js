import { createClient } from '@supabase/supabase-js';

// Lấy link và key từ file .env của Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Khởi tạo và xuất ra biến supabase để ChatAI.jsx dùng
export const supabase = createClient(supabaseUrl, supabaseAnonKey);