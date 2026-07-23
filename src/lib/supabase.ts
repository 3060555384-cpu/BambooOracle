// Cloudflare Workers 代理解决国内网络访问 Supabase 被墙的问题
import { createClient } from '@supabase/supabase-js'

// 生产部署时用同域路径 /supabase（Vercel rewrites 转发到 Worker），
// 避免 QQ/微信内置浏览器拦截跨域请求（它们阻止向第三方域名发请求）。
// 本地开发直连 Worker。
const DEV_WORKER = 'https://quiet-wind-c950.3060555384.workers.dev'
const supabaseUrl = import.meta.env.DEV ? DEV_WORKER : '/supabase'
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
