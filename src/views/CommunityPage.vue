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
    <div class="post-form">
      <textarea v-model="newPost" class="post-input" placeholder="分享你发现的甲骨文知识或有趣文字..." rows="3"></textarea>
      <div class="form-footer">
        <span class="form-hint">{{ newPost.length }}/500</span>
        <button class="btn-ink" @click="submitPost" :disabled="!newPost.trim() || newPost.length > 500">发布</button>
      </div>
    </div>
    <div class="post-list">
      <article v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="post-head">
          <div class="post-user">
            <span class="post-avatar">&#128100;</span>
            <div>
              <span class="post-author">{{ post.author }}</span>
              <span class="post-time">{{ post.time }}</span>
            </div>
          </div>
          <span class="post-tag" @click="selTag = post.tag">{{ post.tag }}</span>
        </div>
        <p class="post-body">{{ post.content }}</p>
        <div class="post-foot">
          <button @click="post.liked = !post.liked" :class="{ liked: post.liked }">
            <span class="heart-icon">{{ post.liked ? '\u2764' : '\u2661' }}</span>
            {{ post.likes + (post.liked ? 1 : 0) }}
          </button>
          <button @click="toggleComments(post)">
            &#128172; {{ post.comments }}
          </button>
          <button>&#128206; 分享</button>
        </div>
        <div v-if="post.showComments" class="comments-section">
          <div v-for="c in post.mockComments" :key="c.id" class="comment-item">
            <span class="comment-author">{{ c.author }}</span>
            <span class="comment-text">{{ c.text }}</span>
            <span class="comment-time">{{ c.time }}</span>
          </div>
        </div>
      </article>
      <div v-if="filteredPosts.length === 0 && selTag" class="empty-state">
        <p>暂无「{{ selTag }}」标签的帖子</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
interface Post { id: number; author: string; time: string; tag: string; content: string; likes: number; liked: boolean; comments: number; showComments: boolean; mockComments: { id: number; author: string; text: string; time: string }[] }
const selTag = ref('')
const newPost = ref('')
const posts = ref<Post[]>([
  { id: 1, author: '殷墟学人', time: '2小时前', tag: '甲骨趣谈', content: '今日发现"雨"字的甲骨文格外传神——上方横线似云，下方数点如雨滴洒落。三千年前的殷人，便以如此简洁的笔画描摹天地万象，令人叹服。', likes: 24, liked: false, comments: 2, showComments: false, mockComments: [{ id: 101, author: '古文字研究者', text: '"雨"字的构形确实精妙，甲骨文中的象形字往往以最少的笔画捕捉事物的本质特征。', time: '1小时前' }, { id: 102, author: '墨甲行者', text: '好发现！对比一下"水"字也很有意思，都是用点和线来表意。', time: '30分钟前' }] },
  { id: 2, author: '古文字研究者', time: '5小时前', tag: '学术动态', content: '分享一则好消息：基于深度学习的甲骨文识别模型最新进展——在OBC306数据集上Top-1准确率已达95%以上，个别高频字接近99%。传统考释与现代AI的碰撞，精彩。', likes: 56, liked: false, comments: 2, showComments: false, mockComments: [{ id: 201, author: '殷墟学人', text: '能分享一下模型和论文链接吗？我们课题组也在做这个方向。', time: '3小时前' }, { id: 202, author: '竹下问甲', text: '这也是我们平台正在接入的技术方向，敬请期待！', time: '2小时前' }] },
  { id: 3, author: '文化守望者', time: '昨天', tag: '字形探源', content: '"人"字的演变颇具意味：甲骨文中作侧立人形，有头、身、臂、腿，栩栩如生。至金文渐简，小篆定型，终成今日楷书"人"字。一撇一捺，千年未断。', likes: 38, liked: false, comments: 1, showComments: false, mockComments: [{ id: 301, author: '墨甲行者', text: '每个汉字的背后都是一部微型文化史，感谢分享。', time: '12小时前' }] },
  { id: 4, author: '竹下问甲', time: '3天前', tag: '平台公告', content: '欢迎来到竹下问甲！本平台致力于以AI技术助力甲骨文识别与考释。识甲功能尚在优化中，欢迎上传拓片图片测试，并留下您的宝贵建议。', likes: 89, liked: false, comments: 2, showComments: false, mockComments: [{ id: 401, author: '殷墟学人', text: '平台很漂亮！期待识甲功能上线。', time: '2天前' }, { id: 402, author: '文化守望者', text: '国风设计太赞了，加油！', time: '1天前' }] },
])
const allTags = ['甲骨趣谈', '学术动态', '字形探源', '平台公告']
const filteredPosts = computed(() => selTag.value ? posts.value.filter(p => p.tag === selTag.value) : posts.value)
let nextId = 5
function submitPost() { if (!newPost.value.trim() || newPost.value.length > 500) return; posts.value.unshift({ id: nextId++, author: '我', time: '刚刚', tag: '甲骨趣谈', content: newPost.value, likes: 0, liked: false, comments: 0, showComments: false, mockComments: [] }); newPost.value = '' }
function toggleComments(post: Post) { post.showComments = !post.showComments }
</script>

<style scoped>
.community-page{max-width:760px;margin:0 auto;padding:0 20px 60px}
.tag-cloud{display:flex;justify-content:center;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.tag-pill{background:var(--paper);border:1px solid var(--paper-dark);color:var(--ink-wash);font-size:.8rem;padding:5px 16px;cursor:pointer;font-family:inherit;letter-spacing:1px;transition:all .3s}
.tag-pill:hover{border-color:var(--gold);color:var(--gold)}
.tag-pill.active{background:var(--gold);color:#fff;border-color:var(--gold)}
.post-form{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:20px 24px;margin-bottom:20px;box-shadow:var(--shadow)}
.post-input{width:100%;border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:14px 16px;font-size:.95rem;resize:vertical;font-family:inherit;outline:none;box-sizing:border-box;background:var(--paper-light);transition:border-color .3s;line-height:1.7}
.post-input:focus{border-color:var(--gold);background:#fff}
.form-footer{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
.form-hint{font-size:.8rem;color:var(--ink-wash)}
.post-list{display:flex;flex-direction:column;gap:16px}
.post-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow);transition:box-shadow .3s}
.post-card:hover{box-shadow:var(--shadow-md)}
.post-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
.post-user{display:flex;align-items:center;gap:10px}
.post-avatar{font-size:2rem;line-height:1}
.post-author{display:block;font-weight:bold;color:var(--ink);font-size:.95rem;letter-spacing:1px}
.post-time{display:block;font-size:.75rem;color:var(--ink-wash)}
.post-tag{background:var(--paper);color:var(--gold);padding:3px 12px;font-size:.75rem;border:1px solid var(--paper-dark);letter-spacing:1px;white-space:nowrap;cursor:pointer;transition:all .2s}
.post-tag:hover{background:var(--gold);color:#fff}
.post-body{font-size:.95rem;color:var(--ink);line-height:1.9;margin-bottom:16px}
.post-foot{display:flex;gap:24px}
.post-foot button{background:none;border:none;color:var(--ink-wash);cursor:pointer;font-size:.85rem;padding:4px 8px;border-radius:var(--radius);transition:all .2s;display:flex;align-items:center;gap:4px}
.post-foot button:hover{color:var(--ink);background:var(--paper)}
.post-foot button.liked{color:var(--cinnabar-light)}
.heart-icon{font-size:1rem}
.comments-section{background:var(--paper);border-radius:var(--radius-md);padding:14px 18px;margin-top:14px;border:1px solid var(--paper-dark)}
.comment-item{display:flex;align-items:baseline;gap:8px;padding:6px 0;font-size:.85rem;flex-wrap:wrap}
.comment-item + .comment-item{border-top:1px solid var(--paper-dark);padding-top:10px;margin-top:4px}
.comment-author{color:var(--gold);font-weight:bold;font-size:.8rem;white-space:nowrap}
.comment-text{color:var(--ink);flex:1;line-height:1.6}
.comment-time{color:var(--ink-wash);font-size:.7rem;white-space:nowrap}
.empty-state{text-align:center;padding:40px 20px;color:var(--ink-wash)}
@media(max-width:600px){.post-head{flex-direction:column;gap:8px}}
</style>
