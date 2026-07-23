// Cloudflare Workers 代理解决国内网络访问 Supabase 被墙的问题
import { createClient } from '@supabase/supabase-js'

// 生产环境用同域路径 /supabase（Vercel rewrites 代理到 Worker），避免 QQ/微信 WebView 跨域拦截
// 开发环境直连 Worker 地址
const supabaseUrl = import.meta.env.PROD
  ? '/supabase'
  : (import.meta.env.VITE_SUPABASE_URL || 'https://quiet-wind-c950.3060555384.workers.dev')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量，请检查 .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})
