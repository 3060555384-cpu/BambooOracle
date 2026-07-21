<template>
  <div class="converter-page">
    <div class="page-header">
      <h1>古今转换器</h1>
      <p>输入今文，化为甲骨风格展示 &mdash; 趣味文字体验</p>
      <hr class="ink-divider" />
    </div>

    <!-- 输入区域 -->
    <section class="input-section">
      <div class="textarea-wrap">
        <textarea
          v-model="inputText"
          placeholder="在此输入现代汉字，最多100字..."
          maxlength="100"
          class="input-textarea"
          autofocus
        ></textarea>
        <div class="char-counter" :class="{ full: inputText.length >= 100 }">
          {{ inputText.length }} / 100
        </div>
      </div>
      <div class="preset-section">
        <span class="preset-label">试试这些：</span>
        <button
          v-for="pt in presets"
          :key="pt"
          class="preset-btn"
          @click="inputText = pt"
        >{{ pt }}</button>
      </div>
    </section>

    <!-- 输出区域 -->
    <section class="output-section" v-if="inputText.length > 0">
      <div class="output-header">
        <h2 class="section-title">转换结果</h2>
        <span class="result-count">共 {{ chars.length }} 字 · 已收录 {{ includedCount }} 字</span>
      </div>
      <div class="oracle-grid">
        <div
          v-for="(ch, idx) in chars"
          :key="idx"
          class="oracle-card"
          :style="{ animationDelay: (idx * 0.06) + 's' }"
          :class="{ included: ch.included }"
        >
          <div class="oracle-char-wrap">
            <div class="oracle-char">{{ ch.display }}</div>
            <div class="oracle-stamp" :class="{ included: ch.included }">
              {{ ch.included ? '已收录' : '未收录' }}
            </div>
          </div>
          <div class="oracle-modern">{{ ch.char }}</div>
          <div class="oracle-meaning" v-if="ch.included">{{ ch.meaning }}</div>
        </div>
      </div>
      <div class="output-actions">
        <button class="btn-ink" @click="copyAll">{{ copied ? '已复制!' : '一键复制全部结果' }}</button>
        <button class="btn-outline" @click="clearAll">清空</button>
      </div>
    </section>

    <!-- 空状态提示 -->
    <section class="empty-state" v-else>
      <div class="empty-card">
        <div class="empty-seal">甲</div>
        <p>在上方输入现代汉字，即刻体验"甲骨转化"之趣</p>
        <p class="empty-sub">收录了 {{ oracleMap.size }} 个甲骨文字，看看你认识哪些？</p>
      </div>
    </section>

    <!-- 说明区域 -->
    <section class="about-section">
      <div class="page-header">
        <h2>关于甲骨文</h2>
        <hr class="ink-divider" />
      </div>
      <div class="about-card">
        <p class="about-text">
          甲骨文是中国已知最早的成体系的文字形式，主要契刻于龟甲和兽骨之上，盛行于殷商时期（约公元前1600年至公元前1046年）。
          1899年，王懿荣首次发现甲骨文，揭开了这一沉睡三千余年古文字的神秘面纱。至今已出土甲骨约15万片，
          发现单字约4,500个，其中可确释者约1,200字。
        </p>
        <p class="about-text">
          甲骨文中象形字、会意字、指事字、形声字四种造字法齐备，是汉字发展史上极为重要的一环。
          它上承原始刻画符号，下启金文、篆书，是中华文明源远流长的文字见证。
          本转换器以趣味方式展示现代汉字与甲骨文字的对照，希望引发更多人对这一古老文字的兴趣。
        </p>
        <p class="about-note">
          * 注意：本转换器仅为趣味展示，并非严谨的学术工具。甲骨文中存在大量未释读文字，
          现代汉字与甲骨文之间并非一一对应关系。部分字符使用甲骨文风格字体呈现，仅供参考。
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

interface OracleEntry {
  char: string
  meaning: string
  category: string
  desc: string
}

interface OutputChar {
  char: string
  display: string
  included: boolean
  meaning: string
}

const inputText = ref('')
const copied = ref(false)
let copyTimer = 0

const presets = [
  '\u5929\u5730\u65E5\u6708',
  '\u5C71\u9AD8\u6C34\u957F',
  '\u98CE\u96E8\u96F7\u7535',
  '\u725B\u9A6C\u7F8A\u72AC',
  '\u4E0A\u4E0B\u51FA\u5165',
  '\u9C7C\u9E1F\u864E\u9E7F',
  '\u5FC3\u53E3\u8033\u76EE',
  '\u738B\u81E3\u5B50\u6C11'
]

const oracleEntries: OracleEntry[] = [
  { char: '\u65E5', meaning: '日 / 太阳', category: '象形字', desc: '外圆象太阳之形，中一点象光。' },
  { char: '\u6708', meaning: '月 / 月亮', category: '象形字', desc: '象半月之形，缺而不满。' },
  { char: '\u4EBA', meaning: '人', category: '象形字', desc: '象人侧立垂臂之形。' },
  { char: '\u5927', meaning: '大', category: '象形字', desc: '象人正面站立、张开双臂之形。' },
  { char: '\u5929', meaning: '天 / 天空', category: '会意字', desc: '从"大"从"一"，一人头顶之上即为天。' },
  { char: '\u96E8', meaning: '雨', category: '象形字', desc: '上象云层，下象雨滴下落之形。' },
  { char: '\u5C71', meaning: '山', category: '象形字', desc: '三峰并立，象山脉连绵起伏之形。' },
  { char: '\u6C34', meaning: '水', category: '象形字', desc: '中间主流水流，两旁水花飞溅。' },
  { char: '\u706B', meaning: '火', category: '象形字', desc: '象火焰上腾之形，下宽上尖。' },
  { char: '\u6728', meaning: '木 / 树', category: '象形字', desc: '上象枝桠，中象树干，下象根须。' },
  { char: '\u738B', meaning: '王 / 首领', category: '象形字', desc: '象斧钺之形，斧钺是王权的象征。' },
  { char: '\u5B50', meaning: '子', category: '象形字', desc: '象婴儿之形，大头、双臂、身体包裹。' },
  { char: '\u9F8D', meaning: '龙', category: '象形字', desc: '象龙之形，有角冠、巨口、长身卷尾。' },
  { char: '\u98A8', meaning: '风', category: '形声字', desc: '从虫凡声。四方风各有专名。' },
  { char: '\u4E0A', meaning: '上', category: '指事字', desc: '以长横为基准，上方短横指示"上"。' },
  { char: '\u4E0B', meaning: '下', category: '指事字', desc: '以长横为基准，下方短横指示"下"。' },
  { char: '\u571F', meaning: '土 / 土地', category: '象形字', desc: '象地上土块之形，一横为地面。' },
  { char: '\u5973', meaning: '女', category: '象形字', desc: '象女子跪坐交手之形。' },
  { char: '\u4E2D', meaning: '中 / 中央', category: '指事字', desc: '一竖贯穿中部，表示正中。' },
  { char: '\u98DF', meaning: '食 / 食物', category: '会意字', desc: '上为口，下为盛食物的器皿。' },
  { char: '\u5FC3', meaning: '心', category: '象形字', desc: '象心脏之形，内分左右心房。' },
  { char: '\u9B5A', meaning: '鱼', category: '象形字', desc: '象鱼之形，有头、身、鳞、尾。' },
  { char: '\u9CE5', meaning: '鸟', category: '象形字', desc: '象鸟之形，有喙、头、身、翅、尾、爪。' },
  { char: '\u864E', meaning: '虎', category: '象形字', desc: '象虎侧视之形，大口、利齿、斑纹。' },
  { char: '\u9E7F', meaning: '鹿', category: '象形字', desc: '象鹿侧视之形，有角、头、身、足。' },
  { char: '\u725B', meaning: '牛', category: '象形字', desc: '象牛首正面之形，双角向上弯曲。' },
  { char: '\u7F8A', meaning: '羊', category: '象形字', desc: '象羊首正面之形，角向下弯曲。' },
  { char: '\u9A6C', meaning: '马', category: '象形字', desc: '象马侧视之形，突出长脸、鬃毛。' },
  { char: '\u8C55', meaning: '豕 / 猪', category: '象形字', desc: '象猪侧视之形，突出长嘴和肥腹。' },
  { char: '\u72AC', meaning: '犬 / 狗', category: '象形字', desc: '象犬侧视张口之形。' },
  { char: '\u7530', meaning: '田 / 田地', category: '象形字', desc: '象纵横交错的田界。' },
  { char: '\u79BE', meaning: '禾 / 谷物', category: '象形字', desc: '上象谷穗下垂，下象根茎。' },
  { char: '\u9EC3', meaning: '黄 / 黄色', category: '象形字', desc: '一说象佩玉璜之形。' },
  { char: '\u767D', meaning: '白 / 白色', category: '象形字', desc: '一说象米粒之形。"白"亦是"伯"的初文。' },
  { char: '\u8D64', meaning: '赤 / 红色', category: '会意字', desc: '从大从火，大火之色为赤。' },
  { char: '\u8840', meaning: '血', category: '指事字', desc: '器皿中有一圆点表示血液。' },
  { char: '\u81E3', meaning: '臣', category: '象形字', desc: '象竖目之形，屈身俯首之状。' },
  { char: '\u76EE', meaning: '目 / 眼睛', category: '象形字', desc: '象人眼之形，外框为眼眶，内为瞳仁。' },
  { char: '\u8033', meaning: '耳 / 耳朵', category: '象形字', desc: '象耳朵轮廓之形。' },
  { char: '\u53E3', meaning: '口 / 嘴巴', category: '象形字', desc: '象人口张开之形。' },
  { char: '\u624B', meaning: '手', category: '象形字', desc: '象手掌五指之形。' },
  { char: '\u6B62', meaning: '止 / 足趾', category: '象形字', desc: '象脚掌和脚趾之形。' },
  { char: '\u884C', meaning: '行 / 行走', category: '象形字', desc: '象十字路口之形，本义为道路。' },
  { char: '\u6765', meaning: '来 / 到来', category: '象形字', desc: '本象麦穗之形，借为"往来"之"来"。' },
  { char: '\u51FA', meaning: '出 / 出去', category: '会意字', desc: '从止从凵，脚从坑中跨出。' },
  { char: '\u5165', meaning: '入 / 进入', category: '指事字', desc: '象尖锐物进入之形。' },
  { char: '\u4E00', meaning: '一', category: '指事字', desc: '以一道横画表示数目一。' },
  { char: '\u4E09', meaning: '三', category: '指事字', desc: '以三道横画表示数目三。' },
  { char: '\u4E94', meaning: '五', category: '指事字', desc: '甲骨文"五"作X形交叉。' },
  { char: '\u5341', meaning: '十', category: '指事字', desc: '以一竖画表示数目十。' },
]

const oracleMap = new Map<string, OracleEntry>()
oracleEntries.forEach(function(e) { oracleMap.set(e.char, e) })

const chars = computed<OutputChar[]>(function() {
  return inputText.value.split('').map(function(ch) {
    var entry = oracleMap.get(ch)
    if (entry) {
      return {
        char: ch,
        display: ch,
        included: true,
        meaning: entry.meaning
      }
    }
    return {
      char: ch,
      display: '\uFF1F',
      included: false,
      meaning: ''
    }
  })
})

const includedCount = computed(function() {
  return chars.value.filter(function(c) { return c.included }).length
})

function copyAll() {
  var text = chars.value.map(function(c) {
    if (c.included) {
      return c.char + ' \u2192 \u7532\u9AA8\u6587\u5B57\uFF1A' + c.display + '\uFF08' + c.meaning + '\uFF09'
    }
    return c.char + ' \u2192 \u672A\u6536\u5F55'
  }).join('\n')
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      copied.value = true
      copyTimer = window.setTimeout(function() { copied.value = false }, 2000)
    })
  } else {
    var ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    copyTimer = window.setTimeout(function() { copied.value = false }, 2000)
  }
}

function clearAll() {
  inputText.value = ''
  copied.value = false
}

onUnmounted(function() {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<style scoped>
.converter-page{max-width:1000px;margin:0 auto;padding:0 20px 60px}

/* === 输入区域 === */
.input-section{margin-top:10px}
.textarea-wrap{position:relative;max-width:700px;margin:0 auto}
.input-textarea{width:100%;height:140px;padding:20px;background:#fff;border:2px solid var(--paper-dark);border-radius:var(--radius-lg);font-size:1.1rem;font-family:inherit;line-height:2;color:var(--ink);resize:vertical;outline:none;box-sizing:border-box;box-shadow:var(--shadow);transition:border-color .3s ease,box-shadow .3s ease}
.input-textarea:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(184,134,11,.08)}
.input-textarea::placeholder{color:var(--ink-wash);opacity:.4;font-family:'KaiTi','STKaiti',serif;letter-spacing:1px}
.char-counter{position:absolute;bottom:12px;right:16px;font-size:.8rem;color:var(--ink-wash);letter-spacing:1px;background:rgba(255,255,255,.85);padding:2px 10px;border-radius:var(--radius);transition:color .3s}
.char-counter.full{color:var(--cinnabar)}
.preset-section{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:18px;flex-wrap:wrap}
.preset-label{font-size:.85rem;color:var(--ink-wash);letter-spacing:1px;margin-right:4px}
.preset-btn{background:var(--paper);border:1px solid var(--paper-dark);color:var(--ink-light);font-family:'KaiTi','STKaiti',serif;font-size:.9rem;letter-spacing:2px;padding:7px 16px;cursor:pointer;border-radius:var(--radius);transition:all .25s ease}
.preset-btn:hover{background:var(--gold);color:#fff;border-color:var(--gold);transform:translateY(-1px);box-shadow:0 3px 12px rgba(184,134,11,.2)}

/* === 输出区域 === */
.output-section{margin-top:40px;animation:fadeSlide .4s ease}
@keyframes fadeSlide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.output-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:8px}
.section-title{font-family:'KaiTi','STKaiti',serif;font-size:1.3rem;color:var(--ink);letter-spacing:3px}
.result-count{font-size:.85rem;color:var(--ink-wash);letter-spacing:1px}

.oracle-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:16px;margin-bottom:28px}
.oracle-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:18px 8px 14px;text-align:center;box-shadow:var(--shadow);opacity:0;animation:cardIn .35s ease forwards;transition:all .3s ease}
@keyframes cardIn{from{opacity:0;transform:scale(.9) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
.oracle-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.oracle-card.included:hover{border-color:var(--gold-pale)}
.oracle-card:not(.included){opacity:.65}
.oracle-card:not(.included):hover{opacity:.85}

.oracle-char-wrap{position:relative;display:inline-flex;flex-direction:column;align-items:center}
.oracle-char{font-family:'KaiTi','STKaiti','SimSun',serif;font-size:56px;color:var(--ink);line-height:1;padding:12px 16px 6px;border:3px solid var(--paper-dark);border-radius:var(--radius-md);background:linear-gradient(180deg,var(--paper-light) 0%,#fff 100%);min-width:72px;min-height:72px;display:flex;align-items:center;justify-content:center;position:relative;transition:all .3s ease}
.oracle-card.included .oracle-char{border-color:var(--gold-pale);box-shadow:inset 0 0 0 1px rgba(184,134,11,.08)}
.oracle-card.included:hover .oracle-char{border-color:var(--gold);color:var(--gold)}

.oracle-char::before{content:'';position:absolute;inset:4px;border:1px solid rgba(184,134,11,.15);border-radius:2px;pointer-events:none}
.oracle-char::after{content:'';position:absolute;top:4px;left:4px;right:4px;height:4px;background:linear-gradient(90deg,transparent,rgba(196,30,30,.06),transparent);pointer-events:none}

.oracle-stamp{font-size:10px;padding:1px 8px;border:1px solid var(--ink-wash);color:var(--ink-wash);font-family:'KaiTi','STKaiti',serif;letter-spacing:2px;margin-top:-1px;border-radius:0 0 3px 3px;transform:rotate(-3deg)}
.oracle-stamp.included{border-color:var(--cinnabar-light);color:var(--cinnabar-light)}

.oracle-modern{font-size:.8rem;color:var(--ink);letter-spacing:1px;margin-top:8px}
.oracle-meaning{font-size:.7rem;color:var(--ink-wash);letter-spacing:1px;margin-top:2px}

.output-actions{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-top:12px}

/* === 空状态 === */
.empty-state{display:flex;justify-content:center;padding:60px 20px}
.empty-card{text-align:center;max-width:400px;padding:50px 36px;background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);box-shadow:var(--shadow)}
.empty-seal{display:inline-flex;width:68px;height:68px;align-items:center;justify-content:center;border:2px solid var(--gold-pale);color:var(--gold-pale);font-family:'KaiTi','STKaiti',serif;font-size:30px;margin-bottom:20px;transform:rotate(-6deg);transition:all .5s ease}
.empty-card:hover .empty-seal{border-color:var(--gold);color:var(--gold);transform:rotate(0deg)}
.empty-card p{font-size:1rem;color:var(--ink-light);letter-spacing:1px;margin-bottom:8px}
.empty-sub{font-size:.85rem!important;color:var(--ink-wash)!important}

/* === 说明区域 === */
.about-section{margin-top:40px}
.about-card{max-width:780px;margin:0 auto;background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:36px;box-shadow:var(--shadow)}
.about-text{font-size:.95rem;color:var(--ink);line-height:2.1;letter-spacing:.5px;margin-bottom:16px;text-indent:2em}
.about-text:last-of-type{margin-bottom:20px}
.about-note{font-size:.82rem;color:var(--ink-wash);line-height:1.9;border-left:3px solid var(--gold-pale);padding-left:16px;background:var(--paper);padding:12px 16px}

@media(max-width:600px){
  .input-textarea{height:120px;font-size:1rem;padding:16px}
  .oracle-grid{grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:10px}
  .oracle-char{font-size:40px;min-width:56px;min-height:56px;padding:10px 12px 4px}
  .oracle-card{padding:14px 4px 10px}
  .preset-section{gap:6px}
  .preset-btn{font-size:.8rem;padding:5px 12px}
  .about-card{padding:24px 20px}
  .about-text{font-size:.88rem;line-height:1.9}
  .output-header{flex-direction:column;align-items:center;text-align:center}
}
</style>
