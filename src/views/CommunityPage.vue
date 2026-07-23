<template>
  <div class="community-page">
    <div class="page-header">
      <h1>同好社群</h1>
      <p>以文会友，共探甲骨</p>
      <hr class="ink-divider" />
    </div>
    <div class="tag-cloud">
      <button v-for="t in allTags" :key="t" class="tag-pill" :class="{ active: selTag === t }" @click="selTag = selTag === t ? '' : t">{{ t }}</button>
    </div>
    <div v-if="user" class="post-form">
      <div class="form-row">
        <select v-model="newTag" class="form-tag-select">
          <option v-for="t in allTags" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <textarea v-model="newPost" class="post-input" placeholder="分享你发现的甲骨文知识或有趣文字..." rows="3"></textarea>
      <div class="form-footer">
        <span class="form-hint" :class="{ over: newPost.length > 500 }">{{ newPost.length }}/500</span>
        <button class="btn-ink" @click="submitPost" :disabled="!newPost.trim() || newPost.length > 500 || posting">发布</button>
      </div>
    </div>
    <div v-else class="post-form login-hint">
      <p>请先<a href="/login">登录</a>后发帖交流</p>
    </div>
    <div class="post-list">
      <p v-if="loading" class="empty-state">加载中...</p>
      <div v-else-if="filteredPosts.length === 0 && selTag" class="empty-state">
        <p>暂无「{{ selTag }}」标签的帖子</p>
      </div>
      <article v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="post-head">
          <div class="post-user">
            <span class="post-avatar">&#128100;</span>
            <div>
              <span class="post-author">{{ post.author }}</span>
              <span class="post-time">{{ formatTime(post.created_at) }}</span>
            </div>
          </div>
          <div class="post-head-right">
            <span class="post-tag" @click="selTag = post.tag">{{ post.tag }}</span>
            <button v-if="user?.id === post.user_id" class="post-del" @click="deletePost(post.id)" title="删除">&times;</button>
          </div>
        </div>
        <p class="post-body">{{ post.content }}</p>
        <div class="post-foot">
          <button @click="post.liked = !post.liked" :class="{ liked: post.liked }">
            <span class="heart-icon">{{ post.liked ? '\u2764' : '\u2661' }}</span>
            {{ (post.likes || 0) + (post.liked ? 1 : 0) }}
          </button>
          <button @click="toggleComments(post)">
            &#128172; {{ post._comments?.length || 0 }}
          </button>
          <button @click="sharePost(post)">&#128206; {{ post.shared ? '已分享' : '分享' }}</button>
        </div>
        <div v-if="post._showComments" class="comments-section">
          <div v-for="c in post._comments" :key="c.id" class="comment-item">
            <span class="comment-author">{{ c.author }}</span>
            <span class="comment-text">{{ c.content }}</span>
            <span class="comment-time">{{ formatTime(c.created_at) }}</span>
          </div>
          <div v-if="user" class="comment-form">
            <input v-model="post._replyText" type="text" placeholder="写下你的看法..." class="comment-input" @keyup.enter="addComment(post)" />
            <button class="btn-ink comment-btn" @click="addComment(post)" :disabled="!post._replyText?.trim()">回复</button>
          </div>
          <p v-else class="empty-state" style="padding:12px;font-size:.8rem">请<a href="/login">登录</a>后发表评论</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

interface Comment { id: number; post_id: number; user_id: string; author: string; content: string; created_at: string }
interface Post { id: number; user_id: string; author: string; tag: string; content: string; likes: number; liked: boolean; shared: boolean; created_at: string; _comments: Comment[]; _showComments: boolean; _replyText: string }

const user = ref<any>(null)
const selTag = ref('')
const newPost = ref('')
const newTag = ref('甲骨趣谈')
const posting = ref(false)
const loading = ref(true)
const posts = ref<Post[]>([])
const allTags = ['甲骨趣谈', '学术动态', '字形探源', '平台公告']

function formatTime(ts: string) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
}

const filteredPosts = computed(() => selTag.value ? posts.value.filter(p => p.tag === selTag.value) : posts.value)

async function loadPosts() {
  loading.value = true
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
  if (!error && data) {
    const postList = data as any[]
    // 加载每条帖子的评论
    for (const p of postList) {
      const { data: comments } = await supabase.from('comments').select('*').eq('post_id', p.id).order('created_at', { ascending: true })
      p._comments = comments || []
      p._showComments = false
      p._replyText = ''
      p.likes = p.likes || 0
      p.liked = false
      p.shared = false
    }
    posts.value = postList
  }
  loading.value = false
}

async function submitPost() {
  if (!newPost.value.trim() || newPost.value.length > 500 || !user.value || posting.value) return
  posting.value = true
  const { data, error } = await supabase.from('posts').insert({
    user_id: user.value.id,
    author: user.value.nickname || '匿名学者',
    content: newPost.value,
    tag: newTag.value
  }).select().single()
  if (!error && data) {
    data._comments = []
    data._showComments = false
    data._replyText = ''
    data.likes = 0
    data.liked = false
    data.shared = false
    posts.value.unshift(data as Post)
    newPost.value = ''
  }
  posting.value = false
}

async function deletePost(id: number) {
  if (!confirm('确定删除这条帖子吗？')) return
  await supabase.from('posts').delete().eq('id', id)
  posts.value = posts.value.filter(p => p.id !== id)
}

async function toggleComments(post: Post) {
  post._showComments = !post._showComments
  if (post._showComments) {
    const { data } = await supabase.from('comments').select('*').eq('post_id', post.id).order('created_at', { ascending: true })
    if (data) post._comments = data
  }
}

async function addComment(post: Post) {
  if (!post._replyText?.trim() || !user.value) return
  const { data, error } = await supabase.from('comments').insert({
    post_id: post.id,
    user_id: user.value.id,
    author: user.value.nickname || '匿名学者',
    content: post._replyText
  }).select().single()
  if (!error && data) {
    post._comments.push(data)
    post._replyText = ''
  }
}

function sharePost(post: Post) {
  const text = '【竹下问甲】' + post.author + ': ' + post.content.slice(0, 50) + '...'
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => { post.shared = true; setTimeout(() => post.shared = false, 2000) })
  } else {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    post.shared = true
    setTimeout(() => post.shared = false, 2000)
  }
}

async function loadUser() {
  try {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      // 先设置基本用户信息
      user.value = {
        id: data.session.user.id,
        email: data.session.user.email,
        nickname: data.session.user.user_metadata?.nickname || '甲骨学者'
      }
      // 异步获取 profiles 昵称（失败不影响）
      try {
        const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', data.session.user.id).single()
        if (profile?.nickname) { user.value.nickname = profile.nickname }
      } catch (_) { /* ignore */ }
      return
    }
  } catch (e) { /* fallback */ }

  try {
    const key = 'sb-pbaxbuscxhtfrvazwbtw-auth-token'
    const raw = localStorage.getItem(key)
    if (raw) {
      const session = JSON.parse(raw)
      if (session?.user) {
        // 先设置基本用户信息
        user.value = {
          id: session.user.id,
          email: session.user.email,
          nickname: session.user.user_metadata?.nickname || '甲骨学者'
        }
        // 异步获取 profiles 昵称（失败不影响）
        try {
          const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', session.user.id).single()
          if (profile?.nickname) { user.value.nickname = profile.nickname }
        } catch (_) { /* ignore */ }
        return
      }
    }
  } catch (e) { /* ignore */ }
}

onMounted(() => {
  loadUser()
  loadPosts()
})
</script>

<style scoped>
.community-page{max-width:760px;margin:0 auto;padding:0 20px 60px}
.tag-cloud{display:flex;justify-content:center;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.tag-pill{background:var(--paper);border:1px solid var(--paper-dark);color:var(--ink-wash);font-size:.8rem;padding:5px 16px;cursor:pointer;font-family:inherit;letter-spacing:1px;transition:all .3s}
.tag-pill:hover{border-color:var(--gold);color:var(--gold)}
.tag-pill.active{background:var(--gold);color:#fff;border-color:var(--gold)}
.post-form{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:20px 24px;margin-bottom:20px;box-shadow:var(--shadow)}
.login-hint{text-align:center;padding:28px!important}
.login-hint p{color:var(--ink-wash);font-size:.9rem}
.login-hint a{color:var(--gold)}
.form-row{margin-bottom:10px}
.form-tag-select{padding:6px 12px;border:1px solid var(--paper-dark);border-radius:var(--radius);font-size:.82rem;font-family:inherit;color:var(--ink);outline:none;background:var(--paper-light);cursor:pointer}
.form-tag-select:focus{border-color:var(--gold)}
.post-input{width:100%;border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:14px 16px;font-size:.95rem;resize:vertical;font-family:inherit;outline:none;box-sizing:border-box;background:var(--paper-light);transition:border-color .3s;line-height:1.7}
.post-input:focus{border-color:var(--gold);background:#fff}
.form-footer{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
.form-hint{font-size:.8rem;color:var(--ink-wash)}
.form-hint.over{color:var(--cinnabar)}
.post-list{display:flex;flex-direction:column;gap:16px}
.post-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow);transition:box-shadow .3s;animation:cardIn .4s ease}
@keyframes cardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.post-card:hover{box-shadow:var(--shadow-md)}
.post-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
.post-user{display:flex;align-items:center;gap:10px}
.post-avatar{font-size:2rem;line-height:1}
.post-author{display:block;font-weight:bold;color:var(--ink);font-size:.95rem;letter-spacing:1px}
.post-time{display:block;font-size:.75rem;color:var(--ink-wash)}
.post-head-right{display:flex;align-items:center;gap:8px}
.post-tag{background:var(--paper);color:var(--gold);padding:3px 12px;font-size:.75rem;border:1px solid var(--paper-dark);letter-spacing:1px;white-space:nowrap;cursor:pointer;transition:all .2s}
.post-tag:hover{background:var(--gold);color:#fff}
.post-del{background:none;border:none;color:var(--ink-wash);cursor:pointer;font-size:1.2rem;padding:0 4px;line-height:1}
.post-del:hover{color:var(--cinnabar)}
.post-body{font-size:.95rem;color:var(--ink);line-height:1.9;margin-bottom:16px}
.post-foot{display:flex;gap:24px}
.post-foot button{background:none;border:none;color:var(--ink-wash);cursor:pointer;font-size:.85rem;padding:4px 8px;border-radius:var(--radius);transition:all .2s;display:flex;align-items:center;gap:4px}
.post-foot button:hover{color:var(--ink);background:var(--paper)}
.post-foot button.liked{color:var(--cinnabar-light)}
.heart-icon{font-size:1rem}
.comments-section{background:var(--paper);border-radius:var(--radius-md);padding:14px 18px;margin-top:14px;border:1px solid var(--paper-dark)}
.comment-item{display:flex;align-items:baseline;gap:8px;padding:6px 0;font-size:.85rem;flex-wrap:wrap}
.comment-item+.comment-item{border-top:1px solid var(--paper-dark);padding-top:10px;margin-top:4px}
.comment-author{color:var(--gold);font-weight:bold;font-size:.8rem;white-space:nowrap}
.comment-text{color:var(--ink);flex:1;line-height:1.6}
.comment-time{color:var(--ink-wash);font-size:.7rem;white-space:nowrap}
.comment-form{display:flex;gap:8px;margin-top:12px}
.comment-input{flex:1;padding:8px 12px;border:1px solid var(--paper-dark);border-radius:var(--radius);font-size:.85rem;font-family:inherit;outline:none;background:#fff}
.comment-input:focus{border-color:var(--gold)}
.comment-btn{padding:6px 16px!important;font-size:.8rem!important}
.empty-state{text-align:center;padding:40px 20px;color:var(--ink-wash)}
.empty-state a{color:var(--gold)}
@media(max-width:600px){.post-head{flex-direction:column;gap:8px}}
</style>
