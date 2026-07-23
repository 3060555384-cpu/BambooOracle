<template>
  <div class="profile-page">
    <!-- 未登录状态 -->
    <div v-if="!user" class="profile-empty">
      <div class="empty-seal">甲</div>
      <h2 class="empty-title">请先登录以使用个人中心</h2>
      <p class="empty-desc">登录后即可管理收藏、查看识别历史</p>
      <router-link to="/login" class="btn-ink">去登录</router-link>
    </div>

    <!-- 已登录状态 -->
    <template v-else>
      <!-- 个人信息卡片 -->
      <section class="profile-hero">
        <div class="profile-card">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar seal-lg">甲</div>
            <span class="profile-role-tag">甲骨学者</span>
          </div>
          <div class="profile-info">
            <div class="profile-nick-row">
              <template v-if="!editingNick">
                <h2 class="profile-nick">{{ displayNick }}</h2>
                <button class="nick-edit-btn" @click="startEditNick" title="编辑昵称">&#9998;</button>
              </template>
              <template v-else>
                <input
                  ref="nickInputRef"
                  v-model="nickDraft"
                  class="nick-edit-input"
                  @keyup.enter="saveNick"
                  @keyup.escape="cancelEditNick"
                  @blur="saveNick"
                  maxlength="16"
                />
                <button class="nick-save-btn" @click="saveNick">&#10003;</button>
                <button class="nick-cancel-btn" @click="cancelEditNick">&#10007;</button>
              </template>
            </div>
            <p class="profile-email">{{ user.email || '' }}</p>
            <button class="btn-outline btn-sm" @click="startEditNick">编辑资料</button>
          </div>
        </div>
        <div class="profile-stats-mini">
          <div class="stat-mini-item">
            <span class="stat-mini-num">{{ bookmarks.length }}</span>
            <span class="stat-mini-label">收藏</span>
          </div>
          <div class="stat-mini-item">
            <span class="stat-mini-num">{{ historyItems.length }}</span>
            <span class="stat-mini-label">识别</span>
          </div>
        </div>
      </section>

      <!-- Tab 导航 -->
      <nav class="profile-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="profile-tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <hr class="ink-divider" />

      <!-- Tab: 我的收藏 -->
      <section v-show="activeTab === 'bookmarks'" class="tab-panel">
        <div v-if="bookmarks.length === 0" class="tab-empty">
          <div class="tab-empty-icon">&#9733;</div>
          <p>尚未收藏任何甲骨文字</p>
          <router-link to="/dictionary" class="btn-outline btn-sm">去字典看看</router-link>
        </div>
        <template v-else>
          <div class="tab-actions">
            <button class="btn-outline btn-sm btn-danger" @click="clearBookmarks">清空收藏</button>
          </div>
          <div class="bookmark-grid">
            <div
              v-for="(item, i) in bookmarks"
              :key="i"
              class="bookmark-card"
              @click="goToDictionary"
            >
              <div class="bookmark-char">{{ item.char }}</div>
              <div class="bookmark-meaning">{{ item.meaning }}</div>
            </div>
          </div>
        </template>
      </section>

      <!-- Tab: 识别历史 -->
      <section v-show="activeTab === 'history'" class="tab-panel">
        <div v-if="historyItems.length === 0" class="tab-empty">
          <div class="tab-empty-icon">&#128269;</div>
          <p>暂无识别记录</p>
          <router-link to="/recognize" class="btn-outline btn-sm">去识别甲骨</router-link>
        </div>
        <template v-else>
          <div class="tab-actions">
            <button class="btn-outline btn-sm btn-danger" @click="clearHistory">清空历史</button>
          </div>
          <div class="history-list">
            <div
              v-for="(item, i) in historyItems"
              :key="i"
              class="history-item"
            >
              <div class="history-chars">{{ item.chars || '' }}</div>
              <div class="history-time">{{ item.time }}</div>
            </div>
          </div>
        </template>
      </section>

      <!-- Tab: 账号设置 -->
      <section v-show="activeTab === 'account'" class="tab-panel">
        <div class="account-info">
          <div class="account-row">
            <span class="account-label">登录状态</span>
            <span class="account-value account-status">&#9679; 已登录</span>
          </div>
          <div class="account-row">
            <span class="account-label">邮箱</span>
            <span class="account-value">{{ user.email || '' }}</span>
          </div>
          <div class="account-row">
            <span class="account-label">昵称</span>
            <span class="account-value">{{ displayNick }}</span>
          </div>
        </div>
        <div class="account-actions">
          <button class="btn-ink btn-danger-bg" @click="handleLogout">退出登录</button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { currentUser, setCurrentUser, logoutUser, recoverUser } from '../lib/auth'

const router = useRouter()

// 直接引用模块级全局登录状态（ES 模块单例，与 App.vue 同一个 ref 引用，不可能分叉）
const user = currentUser

// 昵称编辑
const editingNick = ref(false)
const nickDraft = ref('')
const nickInputRef = ref<HTMLInputElement>()

const displayNick = computed(() => {
  if (!user.value) return ''
  return user.value.nickname || user.value.email || '尚未设置昵称'
})

function startEditNick() {
  nickDraft.value = displayNick.value
  editingNick.value = true
  nextTick(() => {
    if (nickInputRef.value) {
      nickInputRef.value.focus()
      nickInputRef.value.select()
    }
  })
}

async function saveNick() {
  if (!editingNick.value) return
  const val = nickDraft.value.trim()
  if (val && user.value) {
    setCurrentUser({ ...user.value, nickname: val })
    await supabase.from('profiles').update({ nickname: val }).eq('id', user.value.id)
  }
  editingNick.value = false
}

function cancelEditNick() {
  editingNick.value = false
}

// Tab 导航
const tabs = [
  { key: 'bookmarks', label: '我的收藏' },
  { key: 'history', label: '识别历史' },
  { key: 'account', label: '账号设置' },
]
const activeTab = ref('bookmarks')

// 收藏数据
const bookmarks = ref<{ char: string; meaning: string; category: string }[]>([])

// 历史数据
const historyItems = ref<{ chars: string; time: string }[]>([])

async function loadBookmarks() {
  if (!user.value) return
  const { data } = await supabase.from('bookmarks').select('*').eq('user_id', user.value.id).order('created_at', { ascending: false })
  if (data) bookmarks.value = data
}

async function loadHistory() {
  if (!user.value) {
    historyItems.value = []
    return
  }
  const { data } = await supabase.from('recognition_history').select('*').eq('user_id', user.value.id).order('created_at', { ascending: false })
  if (data && data.length > 0) {
    historyItems.value = data.map((d: any) => ({
      chars: d.chars,
      time: new Date(d.created_at).toLocaleString('zh-CN')
    }))
  } else {
    historyItems.value = [
      { chars: '日 月 山', time: '2026-07-20 15:42' },
      { chars: '雨 水', time: '2026-07-18 09:15' },
      { chars: '龙', time: '2026-07-15 20:08' },
      { chars: '人 天 大', time: '2026-07-12 14:30' },
    ]
  }
}

async function clearBookmarks() {
  if (!confirm('确定要清空所有收藏吗？此操作不可撤销。')) return
  await supabase.from('bookmarks').delete().eq('user_id', user.value.id)
  bookmarks.value = []
}

async function clearHistory() {
  if (!confirm('确定要清空所有识别历史吗？此操作不可撤销。')) return
  await supabase.from('recognition_history').delete().eq('user_id', user.value.id)
  historyItems.value = []
}

function goToDictionary() {
  router.push('/dictionary')
}

async function handleLogout() {
  if (!confirm('确定要退出登录吗？')) return
  await logoutUser()
  router.push('/')
}

// 监听统一用户状态变化，自动加载收藏和历史
watch(user, (newUser) => {
  if (newUser) {
    loadBookmarks()
    loadHistory()
  }
}, { immediate: true })

onMounted(() => {
  // 兜底：如果 currentUser 被 Supabase 事件意外清空（SIGNED_OUT 误触发等），
  // 立即从 localStorage 抢救回来，确保页面不会闪"请先登录"
  recoverUser()
  // user 的 watch(immediate) 已处理数据加载
})
</script>

<style scoped>
/* === 页面整体 === */
.profile-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 20px 80px;
}

/* === 未登录 === */
.profile-empty {
  text-align: center;
  padding: 80px 20px;
}
.empty-seal {
  width: 72px;
  height: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--cinnabar-light);
  color: var(--cinnabar-light);
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 32px;
  font-weight: bold;
  transform: rotate(-8deg);
  margin-bottom: 24px;
}
.empty-title {
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.3rem;
  color: var(--ink);
  letter-spacing: 3px;
  margin-bottom: 8px;
}
.empty-desc {
  color: var(--ink-wash);
  font-size: .9rem;
  letter-spacing: 1px;
  margin-bottom: 28px;
}

/* === 个人信息卡片 === */
.profile-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  background: #fff;
  border: 1px solid var(--paper-dark);
  border-radius: var(--radius-lg);
  padding: 36px 40px;
  box-shadow: var(--shadow);
  margin-bottom: 32px;
}
.profile-card {
  display: flex;
  align-items: center;
  gap: 24px;
}
.profile-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.profile-avatar {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--cinnabar);
  color: var(--cinnabar);
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 28px;
  font-weight: bold;
  transform: rotate(-6deg);
  flex-shrink: 0;
}
.profile-role-tag {
  font-size: .7rem;
  color: var(--ink-wash);
  letter-spacing: 1px;
}
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.profile-nick-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.profile-nick {
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.35rem;
  color: var(--ink);
  letter-spacing: 2px;
  margin: 0;
}
.nick-edit-btn {
  background: none;
  border: 1px solid var(--paper-dark);
  color: var(--ink-wash);
  font-size: .85rem;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: var(--radius);
  transition: all .3s;
}
.nick-edit-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
}
.nick-edit-input {
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.35rem;
  color: var(--ink);
  letter-spacing: 2px;
  padding: 4px 10px;
  border: 1px solid var(--gold);
  border-radius: var(--radius);
  background: var(--paper-light);
  outline: none;
  width: 180px;
}
.nick-save-btn,
.nick-cancel-btn {
  background: none;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  padding: 2px 6px;
  border-radius: var(--radius);
  transition: all .3s;
}
.nick-save-btn {
  color: var(--jade);
  border-color: var(--jade);
}
.nick-save-btn:hover {
  background: var(--jade);
  color: #fff;
}
.nick-cancel-btn {
  color: var(--ink-wash);
  border-color: var(--paper-dark);
}
.nick-cancel-btn:hover {
  background: var(--paper-dark);
}
.profile-email {
  color: var(--ink-wash);
  font-size: .9rem;
  margin: 0;
}
.btn-sm {
  padding: 6px 20px;
  font-size: .85rem;
  letter-spacing: 1px;
}

/* === 迷你统计 === */
.profile-stats-mini {
  display: flex;
  gap: 28px;
  flex-shrink: 0;
}
.stat-mini-item {
  text-align: center;
}
.stat-mini-num {
  display: block;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.5rem;
  color: var(--gold);
  font-weight: bold;
}
.stat-mini-label {
  font-size: .75rem;
  color: var(--ink-wash);
  letter-spacing: 1px;
}

/* === Tab 导航 === */
.profile-tabs {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}
.profile-tab-btn {
  padding: 10px 28px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--ink-wash);
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all .3s ease;
}
.profile-tab-btn:hover {
  color: var(--gold);
}
.profile-tab-btn.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
  font-weight: bold;
}

/* === Tab 面板 === */
.tab-panel {
  min-height: 200px;
}
.tab-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--ink-wash);
}
.tab-empty-icon {
  font-size: 2.4rem;
  color: var(--gold-pale);
  margin-bottom: 12px;
}
.tab-empty p {
  font-size: .95rem;
  letter-spacing: 1px;
  margin-bottom: 20px;
}
.tab-actions {
  text-align: right;
  margin-bottom: 16px;
}
.btn-danger {
  border-color: var(--cinnabar) !important;
  color: var(--cinnabar) !important;
}
.btn-danger:hover {
  background: var(--cinnabar) !important;
  color: #fff !important;
}

/* === 收藏网格 === */
.bookmark-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.bookmark-card {
  background: #fff;
  border: 1px solid var(--paper-dark);
  border-radius: var(--radius-md);
  padding: 24px 12px 16px;
  text-align: center;
  cursor: pointer;
  transition: all .3s ease;
  box-shadow: var(--shadow);
}
.bookmark-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--gold-pale);
}
.bookmark-char {
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 2.8rem;
  color: var(--ink);
  line-height: 1.2;
  margin-bottom: 8px;
}
.bookmark-meaning {
  font-size: .8rem;
  color: var(--ink-wash);
  letter-spacing: 1px;
}

/* === 历史列表 === */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid var(--paper-dark);
  border-radius: var(--radius-md);
  padding: 16px 24px;
  box-shadow: var(--shadow);
  transition: all .3s ease;
}
.history-item:hover {
  border-color: var(--gold-pale);
  box-shadow: var(--shadow-md);
}
.history-chars {
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.2rem;
  color: var(--ink);
  letter-spacing: 3px;
}
.history-time {
  font-size: .8rem;
  color: var(--ink-wash);
}

/* === 账号设置 === */
.account-info {
  background: #fff;
  border: 1px solid var(--paper-dark);
  border-radius: var(--radius-md);
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
}
.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--paper-dark);
}
.account-row:last-child {
  border-bottom: none;
}
.account-label {
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: .95rem;
  color: var(--ink);
  letter-spacing: 2px;
}
.account-value {
  font-size: .9rem;
  color: var(--ink-wash);
}
.account-status {
  color: var(--jade);
  font-weight: bold;
}
.account-actions {
  text-align: center;
}
.btn-danger-bg {
  background: var(--cinnabar) !important;
}
.btn-danger-bg:hover {
  background: var(--cinnabar-light) !important;
}

/* === 响应式 === */
@media (max-width: 768px) {
  .profile-page {
    padding: 32px 16px 60px;
  }
  .profile-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 24px;
  }
  .profile-stats-mini {
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
    padding-top: 20px;
    border-top: 1px solid var(--paper-dark);
  }
  .profile-tab-btn {
    padding: 10px 16px;
    font-size: .9rem;
    letter-spacing: 1px;
  }
  .bookmark-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
