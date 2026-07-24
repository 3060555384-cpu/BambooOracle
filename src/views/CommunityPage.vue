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
            <img v-if="post.avatar_url" :src="post.avatar_url" class="post-avatar-img" alt="" />
            <span v-else class="post-avatar">&#128100;</span>
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
            <div class="comment-head">
              <img v-if="c.avatar_url" :src="c.avatar_url" class="comment-avatar-img" alt="" />
              <span class="comment-author">{{ c.author }}</span>
              <span v-if="c.reply_to_author" class="comment-reply-arrow">&#10148;</span>
              <span v-if="c.reply_to_author" class="comment-author comment-reply-to">{{ c.reply_to_author }}</span>
            </div>
            <span class="comment-text">{{ c.content }}</span>
            <div class="comment-foot">
              <span class="comment-time">{{ formatTime(c.created_at) }}</span>
              <button v-if="user" class="comment-reply-btn" @click="startReply(post, c)">回复</button>
            </div>
          </div>
          <div v-if="user" class="comment-form">
            <span v-if="post._replyTo" class="reply-indicator">
              回复 <strong>{{ post._replyTo.author }}</strong>
              <a href="#" @click.prevent="cancelReply(post)">取消</a>
            </span>
            <input v-model="post._replyText" type="text" :placeholder="post._replyTo ? '回复 ' + post._replyTo.author + '...' : '写下你的看法...'" class="comment-input" @keyup.enter="addComment(post)" />
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
import { currentUser, recoverUser } from '../lib/auth'

interface Comment { id: number; post_id: number; user_id: string; author: string; content: string; created_at: string; reply_to_user_id?: string; reply_to_author?: string; avatar_url?: string }
interface Post { id: number; user_id: string; author: string; tag: string; content: string; likes: number; liked: boolean; shared: boolean; created_at: string; _comments: Comment[]; _showComments: boolean; _replyText: string; _replyTo: Comment | null; avatar_url?: string }

// 直接引用模块级全局登录状态（ES 模块单例，与 App.vue 同一个 ref 引用）
const user = currentUser
const selTag = ref('')
const newPost = ref('')
const newTag = ref('甲骨趣谈')
const posting = ref(false)
const loading = ref(true)
const posts = ref<Post[]>([])
const allTags = ['甲骨趣谈', '学术动态', '字形探源', '平台公告']

// 用户头像缓存
const avatarMap = ref<Record<string, string>>({})

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
    // 并行加载所有帖子的评论，避免串行阻塞
    const commentPromises = postList.map(p =>
      supabase.from('comments').select('*').eq('post_id', p.id).order('created_at', { ascending: true })
    )
    const results = await Promise.all(commentPromises)

    // 收集所有涉及的用户 ID，批量查头像
    const userIds = new Set<string>()
    postList.forEach(p => userIds.add(p.user_id))
    results.forEach(({ data: comments }) => {
      (comments || []).forEach((c: any) => userIds.add(c.user_id))
    })

    // 批量查询用户头像
    if (userIds.size > 0) {
      const { data: profiles } = await supabase.from('profiles')
        .select('id,avatar_url').in('id', Array.from(userIds))
      if (profiles) {
        (profiles as any[]).forEach((p: any) => {
          if (p.avatar_url) {
            avatarMap.value = { ...avatarMap.value, [p.id]: p.avatar_url }
          }
        })
      }
    }

    results.forEach(({ data: comments }, i) => {
      const p = postList[i]
      p.avatar_url = avatarMap.value[p.user_id] || ''
      p._comments = (comments || []).map((c: any) => ({ ...c, avatar_url: avatarMap.value[c.user_id] || '' }))
      p._showComments = false
      p._replyText = ''
      p._replyTo = null
      p.likes = p.likes || 0
      p.liked = false
      p.shared = false
    })
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
    data.avatar_url = user.value.avatar_url || ''
    data._comments = []
    data._showComments = false
    data._replyText = ''
    data._replyTo = null
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
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (!error) posts.value = posts.value.filter(p => p.id !== id)
}

async function toggleComments(post: Post) {
  post._showComments = !post._showComments
  if (post._showComments) {
    const { data } = await supabase.from('comments').select('*').eq('post_id', post.id).order('created_at', { ascending: true })
    if (data) {
      // 加载评论者的头像
      const cids = new Set<string>()
      ;(data as any[]).forEach((c: any) => cids.add(c.user_id))
      const needFetch = Array.from(cids).filter(id => !avatarMap.value[id])
      if (needFetch.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id,avatar_url').in('id', needFetch)
        if (profiles) {
          (profiles as any[]).forEach((p: any) => {
            if (p.avatar_url) avatarMap.value = { ...avatarMap.value, [p.id]: p.avatar_url }
          })
        }
      }
      post._comments = (data as any[]).map((c: any) => ({ ...c, avatar_url: avatarMap.value[c.user_id] || '' }))
    }
  }
}

function startReply(post: Post, comment: Comment) {
  post._replyTo = comment
  post._replyText = ''
}

function cancelReply(post: Post) {
  post._replyTo = null
  post._replyText = ''
}

async function addComment(post: Post) {
  if (!post._replyText?.trim() || !user.value) return
  const payload: any = {
    post_id: post.id,
    user_id: user.value.id,
    author: user.value.nickname || '匿名学者',
    content: post._replyText
  }
  if (post._replyTo) {
    payload.reply_to_user_id = post._replyTo.user_id
    payload.reply_to_author = post._replyTo.author
  }
  const { data, error } = await supabase.from('comments').insert(payload).select().single()
  if (error) {
    console.error('评论失败:', error.message)
    alert('评论发送失败: ' + error.message)
    return
  }
  if (data) {
    data.avatar_url = user.value.avatar_url || ''
    post._comments.push(data)
    post._replyText = ''
    post._replyTo = null
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

onMounted(() => {
  recoverUser()
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
.post-avatar-img{width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid var(--paper-dark)}
.comment-avatar-img{width:20px;height:20px;border-radius:50%;object-fit:cover;border:1px solid var(--paper-dark);flex-shrink:0}
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
.comment-item{display:flex;flex-direction:column;gap:4px;padding:6px 0;font-size:.85rem}
.comment-item+.comment-item{border-top:1px solid var(--paper-dark);padding-top:10px;margin-top:4px}
.comment-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.comment-author{color:var(--gold);font-weight:bold;font-size:.8rem;white-space:nowrap}
.comment-reply-arrow{color:var(--ink-wash);font-size:.7rem}
.comment-reply-to{color:var(--cinnabar-light)}
.comment-text{color:var(--ink);line-height:1.6}
.comment-foot{display:flex;align-items:center;gap:10px}
.comment-time{color:var(--ink-wash);font-size:.7rem;white-space:nowrap}
.comment-reply-btn{background:none;border:none;color:var(--ink-wash);cursor:pointer;font-size:.75rem;padding:0;text-decoration:underline dashed;transition:color .2s}
.comment-reply-btn:hover{color:var(--gold)}
.comment-form{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.comment-input{flex:1;padding:8px 12px;border:1px solid var(--paper-dark);border-radius:var(--radius);font-size:.85rem;font-family:inherit;outline:none;background:#fff}
.comment-input:focus{border-color:var(--gold)}
.reply-indicator{font-size:.8rem;color:var(--ink-wash);display:flex;align-items:center;gap:6px}
.reply-indicator strong{color:var(--cinnabar-light)}
.reply-indicator a{color:var(--ink-wash);font-size:.75rem}
.comment-form .comment-input,.comment-form .comment-btn{align-self:stretch;width:100%}
.comment-btn{padding:6px 16px!important;font-size:.8rem!important}
.empty-state{text-align:center;padding:40px 20px;color:var(--ink-wash)}
.empty-state a{color:var(--gold)}
@media(max-width:600px){.post-head{flex-direction:column;gap:8px}}
</style>
