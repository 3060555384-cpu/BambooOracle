// Cloudflare Workers 代理解决国内网络访问 Supabase 被墙的问题
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://quiet-wind-c950.3060555384.workers.dev'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量，请检查 .env.local')
}

// 自定义 fetch：去掉 Supabase SDK 新版本自动添加的自定义请求头
// 否则 Cloudflare Workers 代理会因 CORS 拒绝这些头导致所有数据库请求失败
const customFetch: typeof fetch = (input, init) => {
  if (init?.headers) {
    const headers = new Headers(init.headers)
    headers.delete('accept-profile')
    headers.delete('x-retry-count')
    init = { ...init, headers }
  }
  return fetch(input, init)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  global: {
    fetch: customFetch
  }
})
