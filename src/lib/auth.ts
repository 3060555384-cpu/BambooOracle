// 全局登录态管理：localStorage 为唯一事实来源
// UI 登录态完全独立于 Supabase 内部会话状态
// Supabase auth 事件只做后台静默校验，绝不主动清除 UI 登录态
import { ref } from 'vue'
import { supabase } from './supabase'

const USER_CACHE_KEY = 'bamboooracle-user'
const PROFILE_FETCHED_KEY = 'bamboooracle-profile-fetched'

export interface BambooUser {
  id: string
  email: string
  nickname: string
  avatar_url?: string
}

function readCachedUser(): BambooUser | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    if (raw) {
      const u = JSON.parse(raw)
      if (u && u.id) return u as BambooUser
    }
  } catch (_) { /* ignore */ }
  return null
}

// 模块加载时同步从 localStorage 恢复登录态
// 之后只有 logoutUser() 能把这个值设为 null
export const currentUser = ref<BambooUser | null>(readCachedUser())

// 头像版本号：每次更换头像后递增，用于强制浏览器刷新缓存
export const avatarVersion = ref(Date.now())

export function bumpAvatarVersion() {
  avatarVersion.value = Date.now()
}

// ====== 全局头像预览（通过原生 CustomEvent，避免跨模块响应式问题） ======
export function openAvatarPreview(url: string, name?: string) {
  if (!url) return
  window.dispatchEvent(new CustomEvent('bamboo:avatar-preview', { detail: { url, name: name || '' } }))
}

export function closeAvatarPreview() {
  window.dispatchEvent(new CustomEvent('bamboo:avatar-preview-close'))
}

export function setCurrentUser(u: BambooUser | null) {
  const prev = currentUser.value
  if (prev && u && prev.id === u.id && prev.email === u.email && prev.nickname === u.nickname && prev.avatar_url === u.avatar_url) return
  if (!prev && !u) return
  currentUser.value = u
  try {
    if (u) {
      const cache: BambooUser = { id: u.id, email: u.email, nickname: u.nickname }
      if (u.avatar_url) cache.avatar_url = u.avatar_url
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cache))
    } else {
      localStorage.removeItem(USER_CACHE_KEY)
    }
  } catch (_) { /* ignore */ }
}

// 兜底恢复：如果 currentUser 意外为 null，直接从 localStorage 抢救
// 各页面在察觉到登录态丢失时调用此函数
export function recoverUser() {
  if (!currentUser.value) {
    const cached = readCachedUser()
    if (cached) currentUser.value = cached
  }
}

// profiles 昵称每个浏览器会话只查一次
function fetchProfileOnce(userId: string) {
  try {
    if (sessionStorage.getItem(PROFILE_FETCHED_KEY) === userId) return
    sessionStorage.setItem(PROFILE_FETCHED_KEY, userId)
  } catch (_) { return }
  supabase.from('profiles').select('nickname,avatar_url').eq('id', userId).single()
    .then(({ data: profile }) => {
      if (profile && currentUser.value) {
        const update: Partial<BambooUser> = {}
        if (profile.nickname) update.nickname = profile.nickname
        if (profile.avatar_url) update.avatar_url = profile.avatar_url
        if (Object.keys(update).length > 0) setCurrentUser({ ...currentUser.value, ...update })
      }
    }, () => {})
}

export async function refreshUser() {
  try {
    const { data } = await supabase.auth.getSession()
    const u = data.session?.user
    if (!u) return
    const prev = currentUser.value
    const nickname = prev?.id === u.id && prev?.nickname
      ? prev.nickname
      : (u.user_metadata?.nickname || '甲骨学者')
    setCurrentUser({ id: u.id, email: u.email!, nickname, avatar_url: prev?.id === u.id ? prev?.avatar_url : undefined })
    fetchProfileOnce(u.id)
  } catch (_) { /* 网络异常时保留缓存登录态 */ }
}

export async function logoutUser() {
  try { await supabase.auth.signOut() } catch (_) { /* ignore */ }
  try { sessionStorage.removeItem(PROFILE_FETCHED_KEY) } catch (_) { /* ignore */ }
  setCurrentUser(null)
}

// 监听 Supabase 认证事件（仅后台静默校验，绝不主动清除 UI 登录态）：
// SIGNED_OUT / INITIAL_SESSION / PASSWORD_RECOVERY → 完全忽略，UI 不受影响
// 只有用户主动点退出才会触发 logoutUser() → setCurrentUser(null)
export function initAuthListener() {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
      refreshUser()
    } else if (event === 'SIGNED_IN' && session?.user && currentUser.value?.id !== session.user.id) {
      refreshUser()
    }
    // 其他事件（SIGNED_OUT、INITIAL_SESSION、PASSWORD_RECOVERY）全部忽略
  })
  return () => subscription.unsubscribe()
}
