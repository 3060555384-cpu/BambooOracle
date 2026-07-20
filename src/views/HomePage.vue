<template>
  <div class="home-page">
    <!-- Hero 首屏 -->
    <section class="hero-section">
      <div class="hero-bg">
        <svg class="hero-mountains" viewBox="0 0 1440 500" preserveAspectRatio="none">
          <path class="mountain-1" d="M0,500 L0,280 Q120,180 240,260 Q340,200 420,280 Q540,160 660,260 Q750,190 840,240 Q940,170 1080,270 Q1200,200 1320,260 Q1380,220 1440,250 L1440,500 Z" fill="rgba(26,26,26,0.06)" />
          <path class="mountain-2" d="M0,500 L0,350 Q180,270 360,340 Q500,280 620,350 Q740,280 880,360 Q1000,300 1140,360 Q1280,290 1440,340 L1440,500 Z" fill="rgba(26,26,26,0.03)" />
        </svg>
        <div class="ink-particles">
          <span v-for="i in 8" :key="i" class="ink-dot" :style="{ left: (10 + i * 11) + '%', animationDelay: (i * 0.3) + 's' }"></span>
        </div>
      </div>
      <div class="hero-content" :class="{ visible: heroVisible }">
        <div class="hero-char-row">
          <span class="hero-oracle char-1">&#40845;</span>
          <span class="hero-oracle char-2">&#23665;</span>
          <span class="hero-oracle char-3">&#27700;</span>
        </div>
        <h1 class="hero-title">竹下问甲</h1>
        <hr class="ink-divider" />
        <p class="hero-subtitle">{{ typedSub }}</p>
        <p class="hero-desc" :class="{ visible: heroVisible }">上传拓片，一键识甲 &middot; 查阅字典，溯源文字 &middot; 以文会友，共探殷商</p>
        <div class="hero-btns" :class="{ visible: heroVisible }">
          <router-link to="/recognize" class="btn-ink">&#128269; 开始识甲</router-link>
          <router-link to="/dictionary" class="btn-outline">&#128218; 浏览字典</router-link>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="features-section" ref="featRef">
      <div class="container">
        <div class="features-grid">
          <div v-for="(card, i) in features" :key="i" class="feature-card" :class="{ visible: featVisible }" :style="{ transitionDelay: (i * 0.15) + 's' }">
            <div class="feature-seal-wrap"><div class="feature-seal">{{ card.seal }}</div></div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.desc }}</p>
            <router-link :to="card.link" class="feature-link">{{ card.linkText }} &rarr;</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 今日甲骨 -->
    <section class="daily-section" ref="dailyRef">
      <div class="container" :class="{ visible: dailyVisible }">
        <div class="daily-header">
          <h2 class="daily-title">&#9670; 今日甲骨</h2>
          <p class="daily-date">{{ todayStr }}</p>
        </div>
        <div class="daily-card">
          <div class="daily-char-wrap">
            <span class="daily-char" :class="{ pulse: dailyVisible }">{{ dailyWord.char }}</span>
            <span class="daily-char-seal">甲骨</span>
          </div>
          <div class="daily-body">
            <h3 class="daily-meaning">「{{ dailyWord.char }}」&mdash; {{ dailyWord.meaning }}</h3>
            <p class="daily-desc">{{ dailyWord.desc }}</p>
            <div class="daily-tags">
              <span class="daily-tag">{{ dailyWord.category }}</span>
              <span class="daily-tag">{{ dailyWord.era }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="stats-section" ref="statsRef">
      <div class="container">
        <div class="stats-grid" :class="{ visible: statsVisible }">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <span class="stat-num">{{ stat.counting }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部引文 -->
    <section class="quote-section" ref="quoteRef" :class="{ visible: quoteVisible }">
      <div class="container">
        <blockquote class="ink-quote">
          <p>古者庖牺氏之王天下也，仰则观象于天，俯则观法于地，视鸟兽之文与地之宜，近取诸身，远取诸物，于是始作八卦，以通神明之德，以类万物之情。</p>
          <cite>&mdash; 《说文解字》序</cite>
        </blockquote>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'

const featRef = ref<HTMLElement>()
const dailyRef = ref<HTMLElement>()
const statsRef = ref<HTMLElement>()
const quoteRef = ref<HTMLElement>()

const heroVisible = ref(false)
const featVisible = ref(false)
const dailyVisible = ref(false)
const statsVisible = ref(false)
const quoteVisible = ref(false)

// 打字机效果
const fullSub = 'AI 驱动的甲骨文字识别与文化交流平台'
const typedSub = ref('')
const typeTimer = ref(0)

// 功能卡片数据
const features = [
  { seal: '识', title: '智能识甲', desc: '上传甲骨拓片图片，深度学习模型自动识别甲骨文字，支持多种字体变体与拓片风格。', link: '/recognize', linkText: '体验识别' },
  { seal: '典', title: '甲骨字典', desc: '收录海量甲骨文字，提供字形对照、说文解字与演变溯源，助你读懂千年文字。', link: '/dictionary', linkText: '查阅字典' },
  { seal: '社', title: '同好社群', desc: '甲骨爱好者聚集地——分享有趣的甲骨发现，交流考释心得，共探文字之源。', link: '/community', linkText: '加入社群' },
]

// 统计数据
const stats = reactive([
  { label: '已收录甲骨文单字', target: 4500, counting: '0' },
  { label: '已释读文字', target: 1200, counting: '0' },
  { label: 'AI识别准确率', target: 95.6, counting: '0%' },
  { label: '社群爱好者', target: 3600, counting: '0' },
])

// 日期
const wd = ['日','一','二','三','四','五','六']
const t = new Date()
const todayStr = computed(() => {
  const y = t.getFullYear(); const m = t.getMonth()+1; const d = t.getDate(); const w = wd[t.getDay()]
  return '农历  公元'+y+'年'+m+'月'+d+'日  星期'+w
})

const dc = [
  { char: '日', meaning: '太阳，光明', desc: '象形字，外圆象太阳轮廓，中一点象光。卜辞中常见"今日""之日"，是殷人记日的核心字。', category: '象形字', era: '殷商' },
  { char: '月', meaning: '月亮，月份', desc: '象半月之形，与"日"相对。卜辞中记月、记夜皆用此字，也是殷历的基础。', category: '象形字', era: '殷商' },
  { char: '人', meaning: '人，人类', desc: '象人侧立垂臂之形，简洁传神。卜辞中大量出现，是最基本的象形字之一。', category: '象形字', era: '殷商' },
  { char: '天', meaning: '天空，上天', desc: '从"大"从"一"，一人头上为天。殷人祭天、问天，此字承载了古人对天的敬畏。', category: '会意字', era: '殷商' },
  { char: '雨', meaning: '雨水', desc: '上象云层，下象雨滴。殷人农耕为本，卜辞中频繁卜问"其雨""不雨"。', category: '象形字', era: '殷商' },
  { char: '龙', meaning: '龙，神兽', desc: '象龙首角身尾之形。龙是殷人信仰中的重要神物，司雨、通天。', category: '象形字', era: '殷商' },
  { char: '山', meaning: '山峰', desc: '三峰并立，象山脉连绵。卜辞多用作地名和山神祭祀。', category: '象形字', era: '殷商' },
]
const dailyWord = dc[t.getDay() % dc.length]

// 数字递增动画
function countUp(stat: { target: number; counting: string }, duration: number) {
  const isPercent = String(stat.target).includes('6') // 95.6 hack
  const target = stat.target
  const startTime = performance.now()
  function tick(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const current = target * progress
    if (target >= 100) {
      stat.counting = Math.floor(current).toLocaleString() + (isPercent ? '' : '+')
    } else {
      stat.counting = current.toFixed(1) + '%'
    }
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// IntersectionObserver 滚动动画
onMounted(() => {
  // 打字机效果
  let i = 0
  const type = () => {
    if (i <= fullSub.length) {
      typedSub.value = fullSub.slice(0, i)
      i++
      typeTimer.value = window.setTimeout(type, 80)
    }
  }
  setTimeout(type, 400)

  // Hero 入场
  setTimeout(() => { heroVisible.value = true }, 200)

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const el = entry.target as HTMLElement
      if (el.classList.contains('features-section')) {
        featVisible.value = true
      } else if (el.classList.contains('daily-section')) {
        dailyVisible.value = true
      } else if (el.classList.contains('stats-section')) {
        statsVisible.value = true
        // count up
        stats.forEach(s => countUp(s, 1500))
      } else if (el.classList.contains('quote-section')) {
        quoteVisible.value = true
      }
    })
  }, { threshold: 0.2 })

  if (featRef.value) observer.observe(featRef.value)
  if (dailyRef.value) observer.observe(dailyRef.value)
  if (statsRef.value) observer.observe(statsRef.value)
  if (quoteRef.value) observer.observe(quoteRef.value)
})
</script>

<style scoped>
/* === Hero === */
.hero-section{position:relative;background:linear-gradient(180deg,#faf7f0,var(--paper) 40%,var(--paper-dark));text-align:center;padding:80px 20px 120px;overflow:hidden}
.hero-bg{position:absolute;inset:0;pointer-events:none}
.hero-mountains{position:absolute;bottom:0;left:0;width:100%;height:300px}
.mountain-1{animation:mountainReveal 2s ease-out}
.mountain-2{animation:mountainReveal 2.4s ease-out}
@keyframes mountainReveal{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}

/* 墨点粒子 */
.ink-particles{position:absolute;inset:0;overflow:hidden}
.ink-dot{position:absolute;top:-10px;width:4px;height:4px;background:var(--ink-wash);border-radius:50%;opacity:0;animation:inkFall 5s ease-in infinite}
.ink-dot:nth-child(odd){width:3px;height:3px;animation-duration:6s}
.ink-dot:nth-child(3n){width:5px;height:5px;animation-duration:4.5s;background:var(--gold-pale)}
@keyframes inkFall{0%{opacity:0;transform:translateY(-10px)}10%{opacity:.15}90%{opacity:.15}100%{opacity:0;transform:translateY(500px)}}

.hero-content{position:relative;z-index:1;max-width:700px;margin:0 auto}
.hero-content.visible .hero-title{animation:titleReveal .8s ease-out}
@keyframes titleReveal{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
.hero-char-row{display:flex;justify-content:center;gap:32px;margin-bottom:24px}
.hero-oracle{font-family:'KaiTi','STKaiti',serif;font-size:64px;color:var(--gold-pale);opacity:.6;animation:float 4s ease-in-out infinite}
.char-1{animation-delay:0s}.char-2{animation-delay:.5s}.char-3{animation-delay:1s}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.hero-title{font-family:'KaiTi','STKaiti',serif;font-size:3.2rem;color:var(--ink);letter-spacing:10px;margin-bottom:8px}
.hero-subtitle{font-size:1.1rem;color:var(--gold);letter-spacing:3px;margin-bottom:8px;min-height:1.4em}
.hero-subtitle::after{content:'|';animation:blink .8s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.hero-desc{font-size:.95rem;color:var(--ink-wash);letter-spacing:1px;margin-bottom:36px;opacity:0;transform:translateY(10px);transition:all .6s ease .3s}
.hero-desc.visible{opacity:1;transform:translateY(0)}
.hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;opacity:0;transform:translateY(10px);transition:all .6s ease .6s}
.hero-btns.visible{opacity:1;transform:translateY(0)}

/* === 功能特性 === */
.features-section{padding:0 0 80px;margin-top:-50px;position:relative;z-index:2}
.container{max-width:1100px;margin:0 auto;padding:0 20px}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.feature-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:40px 28px 32px;text-align:center;box-shadow:var(--shadow);opacity:0;transform:translateY(30px);transition:all .6s ease}
.feature-card.visible{opacity:1;transform:translateY(0)}
.feature-card:hover{transform:translateY(-6px)!important;box-shadow:var(--shadow-lg);border-color:var(--gold-pale)}
.feature-seal-wrap{display:flex;justify-content:center;margin-bottom:20px}
.feature-seal{width:52px;height:52px;display:flex;align-items:center;justify-content:center;border:2px solid var(--cinnabar-light);color:var(--cinnabar-light);font-family:'KaiTi','STKaiti',serif;font-size:22px;font-weight:bold;transform:rotate(-6deg);transition:transform .3s}
.feature-card:hover .feature-seal{transform:rotate(0deg)}
.feature-card h3{font-family:'KaiTi','STKaiti',serif;font-size:1.25rem;color:var(--ink);letter-spacing:2px;margin-bottom:12px}
.feature-card p{color:var(--ink-wash);font-size:.9rem;line-height:1.7;margin-bottom:16px}
.feature-link{color:var(--gold);font-size:.9rem;letter-spacing:1px;border-bottom:1px solid transparent;transition:border-color .3s;text-decoration:none}
.feature-link:hover{border-bottom-color:var(--gold)}

/* === 今日甲骨 === */
.daily-section{padding:0 0 80px}
.daily-section .container{opacity:0;transform:translateY(30px);transition:all .8s ease}
.daily-section .container.visible{opacity:1;transform:translateY(0)}
.daily-header{text-align:center;margin-bottom:32px}
.daily-title{font-family:'KaiTi','STKaiti',serif;font-size:1.6rem;color:var(--ink);letter-spacing:4px;margin-bottom:8px}
.daily-date{color:var(--ink-wash);font-size:.85rem;letter-spacing:2px}
.daily-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:40px;display:flex;gap:40px;align-items:center;box-shadow:var(--shadow);max-width:800px;margin:0 auto;transition:box-shadow .4s}
.daily-card:hover{box-shadow:var(--shadow-lg)}
.daily-char-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;flex-shrink:0}
.daily-char{font-family:'KaiTi','STKaiti',serif;font-size:80px;color:var(--ink);line-height:1;transition:color .4s}
.daily-char.pulse{animation:charPulse 1s ease-out}
@keyframes charPulse{0%{transform:scale(.5);opacity:0;color:var(--cinnabar)}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1;color:var(--ink)}}
.daily-char-seal{font-size:12px;color:var(--cinnabar-light);border:1px solid var(--cinnabar-light);padding:2px 10px;font-family:'KaiTi','STKaiti',serif;letter-spacing:2px;transform:rotate(-3deg)}
.daily-meaning{font-family:'KaiTi','STKaiti',serif;font-size:1.2rem;color:var(--ink);letter-spacing:2px;margin-bottom:12px}
.daily-desc{color:var(--ink-wash);font-size:.95rem;line-height:1.9;margin-bottom:16px}
.daily-tags{display:flex;gap:8px;flex-wrap:wrap}
.daily-tag{background:var(--paper);color:var(--ink-wash);font-size:.8rem;padding:3px 12px;border:1px solid var(--paper-dark);letter-spacing:1px}

/* === 统计数据 === */
.stats-section{padding:0 0 80px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:900px;margin:0 auto;opacity:0;transform:translateY(20px);transition:all .8s ease}
.stats-grid.visible{opacity:1;transform:translateY(0)}
.stat-item{text-align:center;padding:28px 16px;background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-md);box-shadow:var(--shadow);transition:all .3s}
.stat-item:hover{transform:translateY(-3px);box-shadow:var(--shadow-md)}
.stat-num{display:block;font-family:'KaiTi','STKaiti',serif;font-size:1.8rem;color:var(--gold);font-weight:bold;letter-spacing:1px;margin-bottom:6px;transition:color .3s}
.stat-item:hover .stat-num{color:var(--cinnabar-light)}
.stat-label{font-size:.8rem;color:var(--ink-wash);letter-spacing:1px}

/* === 引文 === */
.quote-section{padding:0 0 80px;opacity:0;transform:translateY(20px);transition:all .8s ease}
.quote-section.visible{opacity:1;transform:translateY(0)}
.ink-quote{max-width:680px;margin:0 auto;text-align:center;padding:32px 40px;border-left:3px solid var(--gold-pale);border-right:3px solid var(--gold-pale);background:linear-gradient(90deg,transparent,rgba(184,134,11,.03),transparent)}
.ink-quote p{font-family:'KaiTi','STKaiti',serif;font-size:1rem;color:var(--ink);line-height:2.2;letter-spacing:1px;margin-bottom:16px}
.ink-quote cite{font-size:.85rem;color:var(--ink-wash);font-style:normal;letter-spacing:2px}

@media(max-width:768px){
  .hero-title{font-size:2rem;letter-spacing:6px}
  .hero-oracle{font-size:40px}
  .features-grid{grid-template-columns:1fr}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .daily-card{flex-direction:column;text-align:center}
  .daily-tags{justify-content:center}
  .ink-quote{padding:24px 20px}
}
</style>