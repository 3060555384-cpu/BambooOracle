// Cloudflare Workers 代理解决国内网络访问 Supabase 被墙的问题
// 生产环境: 通过 VITE_SUPABASE_URL 环境变量传入 Workers 地址
// 本地开发: 直接从 Supabase 连接（本地有 VPN 时使用）
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://quiet-wind-c950.3060555384.workers.dev'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量，请检查 .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
