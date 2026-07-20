<template>
  <div class="community-page">
    <div class="page-header">
      <h1>同好社群</h1>
      <p>以文会友，共探甲骨</p>
      <hr class="ink-divider" />
    </div>
    <div class="post-form">
      <textarea v-model="newPost" class="post-input" placeholder="分享你发现的甲骨文知识或有趣文字..." rows="3"></textarea>
      <div class="form-footer">
        <span class="form-hint">{{ newPost.length }}/500</span>
        <button class="btn-ink" @click="submitPost" :disabled="!newPost.trim() || newPost.length > 500">发布</button>
      </div>
    </div>
    <div class="post-list">
      <article v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-head">
          <div class="post-user">
            <span class="post-avatar">&#128100;</span>
            <div>
              <span class="post-author">{{ post.author }}</span>
              <span class="post-time">{{ post.time }}</span>
            </div>
          </div>
          <span class="post-tag">{{ post.tag }}</span>
        </div>
        <p class="post-body">{{ post.content }}</p>
        <div class="post-foot">
          <button @click="post.liked = !post.liked" :class="{ liked: post.liked }">
            <span class="heart-icon">{{ post.liked ? '\u2764' : '\u2661' }}</span>
            {{ post.likes + (post.liked ? 1 : 0) }}
          </button>
          <button>&#128172; {{ post.comments }}</button>
          <button>&#128206; 分享</button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
interface Post { id: number; author: string; time: string; tag: string; content: string; likes: number; liked: boolean; comments: number }
const newPost = ref('')
const posts = ref<Post[]>([
  { id: 1, author: '殷墟学人', time: '2小时前', tag: '甲骨趣谈', content: '今日发现"雨"字的甲骨文格外传神——上方横线似云，下方数点如雨滴洒落。三千年前的殷人，便以如此简洁的笔画描摹天地万象，令人叹服。', likes: 24, liked: false, comments: 5 },
  { id: 2, author: '古文字研究者', time: '5小时前', tag: '学术动态', content: '分享一则好消息：基于深度学习的甲骨文识别模型最新进展——在OBC306数据集上Top-1准确率已达95%以上，个别高频字接近99%。传统考释与现代AI的碰撞，精彩。', likes: 56, liked: false, comments: 12 },
  { id: 3, author: '文化守望者', time: '昨天', tag: '字形探源', content: '"人"字的演变颇具意味：甲骨文中作侧立人形，有头、身、臂、腿，栩栩如生。至金文渐简，小篆定型，终成今日楷书"人"字。一撇一捺，千年未断。', likes: 38, liked: false, comments: 7 },
  { id: 4, author: '竹下问甲', time: '3天前', tag: '平台公告', content: '欢迎来到竹下问甲！本平台致力于以AI技术助力甲骨文识别与考释。识甲功能尚在优化中，欢迎上传拓片图片测试，并留下您的宝贵建议。', likes: 89, liked: false, comments: 15 },
])
let nextId = 5
function submitPost() { if (!newPost.value.trim() || newPost.value.length > 500) return; posts.value.unshift({ id: nextId++, author: '我', time: '刚刚', tag: '甲骨趣谈', content: newPost.value, likes: 0, liked: false, comments: 0 }); newPost.value = '' }
</script>

<style scoped>
.community-page{max-width:760px;margin:0 auto;padding:0 20px 60px}
.post-form{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:20px 24px;margin-bottom:28px;box-shadow:var(--shadow)}
.post-input{width:100%;border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:14px 16px;font-size:.95rem;resize:vertical;font-family:inherit;outline:none;box-sizing:border-box;background:var(--paper-light);transition:border-color .3s;line-height:1.7}
.post-input:focus{border-color:var(--gold);background:#fff}
.form-footer{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
.form-hint{font-size:.8rem;color:var(--ink-wash)}
.post-list{display:flex;flex-direction:column;gap:20px}
.post-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow);transition:box-shadow .3s}
.post-card:hover{box-shadow:var(--shadow-md)}
.post-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
.post-user{display:flex;align-items:center;gap:10px}
.post-avatar{font-size:2rem;line-height:1}
.post-author{display:block;font-weight:bold;color:var(--ink);font-size:.95rem;letter-spacing:1px}
.post-time{display:block;font-size:.75rem;color:var(--ink-wash)}
.post-tag{background:var(--paper);color:var(--gold);padding:3px 12px;font-size:.75rem;border:1px solid var(--paper-dark);letter-spacing:1px;white-space:nowrap}
.post-body{font-size:.95rem;color:var(--ink);line-height:1.9;margin-bottom:16px}
.post-foot{display:flex;gap:24px}
.post-foot button{background:none;border:none;color:var(--ink-wash);cursor:pointer;font-size:.85rem;padding:4px 8px;border-radius:var(--radius);transition:all .2s;display:flex;align-items:center;gap:4px}
.post-foot button:hover{color:var(--ink);background:var(--paper)}
.post-foot button.liked{color:var(--cinnabar-light)}
.heart-icon{font-size:1rem}
@media(max-width:600px){.post-head{flex-direction:column;gap:8px}}
</style>