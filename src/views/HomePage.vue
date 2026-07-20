<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-bg">
        <svg class="hero-mountains" viewBox="0 0 1440 500" preserveAspectRatio="none">
          <path d="M0,500 L0,280 Q120,180 240,260 Q340,200 420,280 Q540,160 660,260 Q750,190 840,240 Q940,170 1080,270 Q1200,200 1320,260 Q1380,220 1440,250 L1440,500 Z" fill="rgba(26,26,26,0.06)" />
          <path d="M0,500 L0,350 Q180,270 360,340 Q500,280 620,350 Q740,280 880,360 Q1000,300 1140,360 Q1280,290 1440,340 L1440,500 Z" fill="rgba(26,26,26,0.03)" />
        </svg>
      </div>
      <div class="hero-content">
        <div class="hero-char-row"><span class="hero-oracle char-1">&#40845;</span><span class="hero-oracle char-2">&#23665;</span><span class="hero-oracle char-3">&#27700;</span></div>
        <h1 class="hero-title">竹下问甲</h1><hr class="ink-divider" />
        <p class="hero-subtitle">AI 驱动的甲骨文字识别与文化交流平台</p>
        <p class="hero-desc">上传拓片，一键识甲 &middot; 查阅字典，溯源文字 &middot; 以文会友，共探殷商</p>
        <div class="hero-btns"><router-link to="/recognize" class="btn-ink">&#128269; 开始识甲</router-link><router-link to="/dictionary" class="btn-outline">&#128218; 浏览字典</router-link></div>
      </div>
    </section>
    <section class="features-section"><div class="container"><div class="features-grid">
      <div class="feature-card"><div class="feature-seal-wrap"><div class="feature-seal">识</div></div><h3>智能识甲</h3><p>上传甲骨拓片图片，深度学习模型自动识别甲骨文字，支持多种字体变体与拓片风格。</p><router-link to="/recognize" class="feature-link">体验识别 &rarr;</router-link></div>
      <div class="feature-card"><div class="feature-seal-wrap"><div class="feature-seal">典</div></div><h3>甲骨字典</h3><p>收录海量甲骨文字，提供字形对照、说文解字与演变溯源，助你读懂千年文字。</p><router-link to="/dictionary" class="feature-link">查阅字典 &rarr;</router-link></div>
      <div class="feature-card"><div class="feature-seal-wrap"><div class="feature-seal">社</div></div><h3>同好社群</h3><p>甲骨爱好者聚集地——分享有趣的甲骨发现，交流考释心得，共探文字之源。</p><router-link to="/community" class="feature-link">加入社群 &rarr;</router-link></div>
    </div></div></section>
    <section class="daily-section"><div class="container"><div class="daily-header"><h2 class="daily-title">&#9670; 今日甲骨</h2><p class="daily-date">{{ todayStr }}</p></div>
      <div class="daily-card"><div class="daily-char-wrap"><span class="daily-char">{{ dailyWord.char }}</span><span class="daily-char-seal">甲骨</span></div>
        <div class="daily-body"><h3 class="daily-meaning">「{{ dailyWord.char }}」&mdash; {{ dailyWord.meaning }}</h3><p class="daily-desc">{{ dailyWord.desc }}</p><div class="daily-tags"><span class="daily-tag">{{ dailyWord.category }}</span><span class="daily-tag">{{ dailyWord.era }}</span></div></div>
    </div></div></section>
    <section class="stats-section"><div class="container"><div class="stats-grid">
      <div class="stat-item"><span class="stat-num">4,500+</span><span class="stat-label">已收录甲骨文单字</span></div>
      <div class="stat-item"><span class="stat-num">1,200+</span><span class="stat-label">已释读文字</span></div>
      <div class="stat-item"><span class="stat-num">95.6%</span><span class="stat-label">AI识别准确率</span></div>
      <div class="stat-item"><span class="stat-num">3,600+</span><span class="stat-label">社群爱好者</span></div>
    </div></div></section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const wd = ['日','一','二','三','四','五','六']
const t = new Date()
const todayStr = computed(() => { const y=t.getFullYear(); const m=t.getMonth()+1; const d=t.getDate(); const w=wd[t.getDay()]; return '农历  公元'+y+'年'+m+'月'+d+'日  星期'+w })
const dc = [
  { char: '\u65E5', meaning: '太阳，光明', desc: '象形字，外圆象太阳轮廓，中一点象光。卜辞中常见"今日""之日"，是殷人记日的核心字。', category: '象形字', era: '殷商' },
  { char: '\u6708', meaning: '月亮，月份', desc: '象半月之形，与"日"相对。卜辞中记月、记夜皆用此字，也是殷历的基础。', category: '象形字', era: '殷商' },
  { char: '\u4EBA', meaning: '人，人类', desc: '象人侧立垂臂之形，简洁传神。卜辞中大量出现，是最基本的象形字之一。', category: '象形字', era: '殷商' },
  { char: '\u5929', meaning: '天空，上天', desc: '从"大"从"一"，一人头上为天。殷人祭天、问天，此字承载了古人对天的敬畏。', category: '会意字', era: '殷商' },
  { char: '\u96E8', meaning: '雨水', desc: '上象云层，下象雨滴。殷人农耕为本，卜辞中频繁卜问"其雨""不雨"。', category: '象形字', era: '殷商' },
  { char: '\u9F8D', meaning: '龙，神兽', desc: '象龙首角身尾之形。龙是殷人信仰中的重要神物，司雨、通天。', category: '象形字', era: '殷商' },
  { char: '\u5C71', meaning: '山峰', desc: '三峰并立，象山脉连绵。卜辞多用作地名和山神祭祀。', category: '象形字', era: '殷商' },
]
const dailyWord = dc[t.getDay() % dc.length]
</script>

<style scoped>
.hero-section{position:relative;background:linear-gradient(180deg,#faf7f0,var(--paper) 40%,var(--paper-dark));text-align:center;padding:80px 20px 100px;overflow:hidden}
.hero-bg{position:absolute;inset:0;pointer-events:none}
.hero-mountains{position:absolute;bottom:0;left:0;width:100%;height:280px}
.hero-content{position:relative;z-index:1;max-width:700px;margin:0 auto}
.hero-char-row{display:flex;justify-content:center;gap:32px;margin-bottom:24px}
.hero-oracle{font-family:'KaiTi','STKaiti',serif;font-size:64px;color:var(--gold-pale);opacity:0.6;animation:float 4s ease-in-out infinite}
.char-1{animation-delay:0s}.char-2{animation-delay:.5s}.char-3{animation-delay:1s}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.hero-title{font-family:'KaiTi','STKaiti',serif;font-size:3.2rem;color:var(--ink);letter-spacing:10px;margin-bottom:8px}
.hero-subtitle{font-size:1.1rem;color:var(--gold);letter-spacing:3px;margin-bottom:8px}
.hero-desc{font-size:.95rem;color:var(--ink-wash);letter-spacing:1px;margin-bottom:36px}
.hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.features-section{padding:0 0 80px;margin-top:-50px;position:relative;z-index:2}
.container{max-width:1100px;margin:0 auto;padding:0 20px}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.feature-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:40px 28px 32px;text-align:center;box-shadow:var(--shadow);transition:all .4s ease}
.feature-card:hover{transform:translateY(-6px);box-shadow:var(--shadow-lg);border-color:var(--gold-pale)}
.feature-seal-wrap{display:flex;justify-content:center;margin-bottom:20px}
.feature-seal{width:52px;height:52px;display:flex;align-items:center;justify-content:center;border:2px solid var(--cinnabar-light);color:var(--cinnabar-light);font-family:'KaiTi','STKaiti',serif;font-size:22px;font-weight:bold;transform:rotate(-6deg)}
.feature-card h3{font-family:'KaiTi','STKaiti',serif;font-size:1.25rem;color:var(--ink);letter-spacing:2px;margin-bottom:12px}
.feature-card p{color:var(--ink-wash);font-size:.9rem;line-height:1.7;margin-bottom:16px}
.feature-link{color:var(--gold);font-size:.9rem;letter-spacing:1px;border-bottom:1px solid transparent;transition:border-color .3s;text-decoration:none}
.feature-link:hover{border-bottom-color:var(--gold)}
.daily-section{padding:0 0 80px}
.daily-header{text-align:center;margin-bottom:32px}
.daily-title{font-family:'KaiTi','STKaiti',serif;font-size:1.6rem;color:var(--ink);letter-spacing:4px;margin-bottom:8px}
.daily-date{color:var(--ink-wash);font-size:.85rem;letter-spacing:2px}
.daily-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:40px;display:flex;gap:40px;align-items:center;box-shadow:var(--shadow);max-width:800px;margin:0 auto}
.daily-char-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;flex-shrink:0}
.daily-char{font-family:'KaiTi','STKaiti',serif;font-size:80px;color:var(--ink);line-height:1}
.daily-char-seal{font-size:12px;color:var(--cinnabar-light);border:1px solid var(--cinnabar-light);padding:2px 10px;font-family:'KaiTi','STKaiti',serif;letter-spacing:2px;transform:rotate(-3deg)}
.daily-meaning{font-family:'KaiTi','STKaiti',serif;font-size:1.2rem;color:var(--ink);letter-spacing:2px;margin-bottom:12px}
.daily-desc{color:var(--ink-wash);font-size:.95rem;line-height:1.9;margin-bottom:16px}
.daily-tags{display:flex;gap:8px;flex-wrap:wrap}
.daily-tag{background:var(--paper);color:var(--ink-wash);font-size:.8rem;padding:3px 12px;border:1px solid var(--paper-dark);letter-spacing:1px}
.stats-section{padding:0 0 80px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:900px;margin:0 auto}
.stat-item{text-align:center;padding:28px 16px;background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-md);box-shadow:var(--shadow)}
.stat-num{display:block;font-family:'KaiTi','STKaiti',serif;font-size:1.8rem;color:var(--gold);font-weight:bold;letter-spacing:1px;margin-bottom:6px}
.stat-label{font-size:.8rem;color:var(--ink-wash);letter-spacing:1px}
@media(max-width:768px){.hero-title{font-size:2rem;letter-spacing:6px}.hero-oracle{font-size:40px}.features-grid{grid-template-columns:1fr}.stats-grid{grid-template-columns:repeat(2,1fr)}.daily-card{flex-direction:column;text-align:center}.daily-tags{justify-content:center}}
</style>
