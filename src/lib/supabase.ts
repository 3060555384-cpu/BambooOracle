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
  console.warn('Supabase 环境变量缺失，部分功能不可用。请检查 .env.local 中的 VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
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
  try {
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) {
      if (error.message.includes('not found') || error.message.includes('exist')) {
        console.error('Storage bucket "avatars" 不存在，请在 Supabase 控制台创建')
      } else {
        console.error('头像上传失败:', error.message)
      }
      return null
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    return urlData.publicUrl
  } catch (err) {
    console.error('头像上传异常:', err)
    return null
  }
}
