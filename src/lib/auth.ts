// 全局登录态管理：localStorage 为唯一事实来源
// UI 登录态完全独立于 Supabase 内部会话状态
// Supabase auth 事件只做后台静默校验，绝不主动清除 UI 登录态
import { ref } from 'vue'
import { supabase } from './supabase'

const USER_CACHE_KEY = 'bamboooracle-user'
const PROFILE_FETCHED_KEY = 'bamboooracle-profile-fetched'

function readCachedUser(): any {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    if (raw) {
      const u = JSON.parse(raw)
      if (u && u.id) return u
    }
  } catch (_) { /* ignore */ }
  return null
}

// 模块加载时同步从 localStorage 恢复登录态
// 之后只有 logoutUser() 能把这个值设为 null
export const currentUser = ref<any>(readCachedUser())

export function setCurrentUser(u: any) {
  const prev = currentUser.value
  if (prev && u && prev.id === u.id && prev.email === u.email && prev.nickname === u.nickname) return
  if (!prev && !u) return
  currentUser.value = u
  try {
    if (u) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify({ id: u.id, email: u.email, nickname: u.nickname }))
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
  supabase.from('profiles').select('nickname').eq('id', userId).single()
    .then(({ data: profile }) => {
      if (profile?.nickname && currentUser.value) {
        setCurrentUser({ ...currentUser.value, nickname: profile.nickname })
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
    setCurrentUser({ id: u.id, email: u.email, nickname })
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
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
      refreshUser()
    } else if (event === 'SIGNED_IN' && session?.user && currentUser.value?.id !== session.user.id) {
      refreshUser()
    }
    // 其他事件（SIGNED_OUT、INITIAL_SESSION、PASSWORD_RECOVERY）全部忽略
  })
}
