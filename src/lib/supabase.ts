// Cloudflare Workers 代理解决国内网络访问 Supabase 被墙的问题
import { createClient } from '@supabase/supabase-js'

// 生产部署时用同域路径 /supabase（Vercel rewrites 转发到 Worker），
// 避免 QQ/微信内置浏览器拦截跨域请求（它们阻止向第三方域名发请求）。
// 本地开发直连 Worker。
const DEV_WORKER = 'https://quiet-wind-c950.3060555384.workers.dev'
// Supabase SDK 要求完整 URL，生产环境用 origin + /supabase 实现同域请求
const supabaseUrl = import.meta.env.DEV
  ? DEV_WORKER
  : (typeof window !== 'undefined' ? window.location.origin : '') + '/supabase'
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

// 头像上传到 Supabase Storage
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${userId}.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) {
    console.error('头像上传失败:', error.message)
    return null
  }
  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
  return urlData.publicUrl
}
