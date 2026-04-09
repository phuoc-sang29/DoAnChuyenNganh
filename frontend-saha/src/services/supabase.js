import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Khởi tạo và export client để toàn bộ dự án dùng chung 1 kết nối
export const supabase = createClient(supabaseUrl, supabaseAnonKey);