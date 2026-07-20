<template>
  <div class="community-page">
    <div class="page-header">
      <h1>&#128172; 爱好者社区</h1>
      <p>分享有趣的甲骨文，交流学习心得，一起探索古老文字</p>
    </div>

    <div class="post-form">
      <textarea v-model="newPost" class="post-input" placeholder="分享你发现的甲骨文知识或有趣的文字..." rows="3"></textarea>
      <button class="btn-post" @click="submitPost" :disabled="!newPost.trim()">&#128221; 发布</button>
    </div>

    <div class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-meta">
          <span class="post-avatar">&#128100;</span>
          <span class="post-author">{{ post.author }}</span>
          <span class="post-time">{{ post.time }}</span>
          <span class="post-tag">{{ post.tag }}</span>
        </div>
        <p class="post-content">{{ post.content }}</p>
        <div class="post-actions">
          <button @click="post.liked = !post.liked" :class="{ liked: post.liked }">
            {{ post.liked ? '\u2764' : '\u2661' }} {{ post.likes + (post.liked ? 1 : 0) }}
          </button>
          <button>&#128172; {{ post.comments }}</button>
          <button>&#128206; 分享</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Post {
  id: number
  author: string
  time: string
  tag: string
  content: string
  likes: number
  liked: boolean
  comments: number
}

const newPost = ref('')

const posts = ref<Post[]>([
  { id: 1, author: '甲骨学爱好者', time: '2小时前', tag: '#甲骨趣谈', content: '今天发现"雨"字的甲骨文特别形象，上面的点就像雨滴落下，真是古人的智慧！', likes: 24, liked: false, comments: 5 },
  { id: 2, author: '古文字研究', time: '5小时前', tag: '#学术交流', content: '分享一篇关于甲骨文数字化的论文：利用深度学习模型进行甲骨文识别的最新进展。准确率已经达到95%以上！', likes: 56, liked: false, comments: 12 },
  { id: 3, author: '文化传承者', time: '昨天', tag: '#学习笔记', content: '"人"字的演变很有意思：从甲骨文的侧立人形，到金文、篆书，再到今天的楷书，形态变化很大但核心特征一直保留。', likes: 38, liked: false, comments: 7 },
])

let nextId = 4

function submitPost() {
  if (!newPost.value.trim()) return
  posts.value.unshift({
    id: nextId++,
    author: '我',
    time: '刚刚',
    tag: '#甲骨趣谈',
    content: newPost.value,
    likes: 0,
    liked: false,
    comments: 0
  })
  newPost.value = ''
}
</script>

<style scoped>
.community-page { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
.page-header { text-align: center; margin-bottom: 30px; }
.page-header h1 { font-size: 28px; color: #1a1a2e; }
.page-header p { color: #888; margin-top: 8px; }

.post-form { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
.post-input { width: 100%; border: 1px solid #e0d6c8; border-radius: 8px; padding: 14px; font-size: 15px; resize: vertical; font-family: inherit; outline: none; box-sizing: border-box; }
.post-input:focus { border-color: #c9a96e; }
.btn-post { margin-top: 12px; padding: 10px 28px; background: #c9a96e; color: #1a1a2e; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; }
.btn-post:disabled { opacity: 0.5; cursor: not-allowed; }

.post-list { display: flex; flex-direction: column; gap: 16px; }
.post-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
.post-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 13px; color: #888; }
.post-author { font-weight: bold; color: #333; }
.post-tag { background: #fff8e1; color: #a08050; padding: 2px 10px; border-radius: 20px; font-size: 12px; }
.post-content { font-size: 15px; color: #333; line-height: 1.8; margin-bottom: 12px; }
.post-actions { display: flex; gap: 20px; }
.post-actions button { background: none; border: none; color: #888; cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 4px; }
.post-actions button:hover { background: #f5f0e8; }
.post-actions button.liked { color: #e74c3c; }
</style>
