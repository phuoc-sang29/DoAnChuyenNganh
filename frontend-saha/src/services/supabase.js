// File: supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Dòng 11 gây lỗi - CHÚNG TA KHÔNG CHẠY NÓ NỮA
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Thay bằng dòng này để các file khác import vào không bị sập
export const supabase = null; 

console.log("Đã vô hiệu hóa kết nối trực tiếp Supabase để dùng Backend C#!");