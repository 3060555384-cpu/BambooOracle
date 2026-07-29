<template>
  <div class="studio-page">
    <div class="page-header">
      <h1>甲骨临摹台</h1>
      <p>挥毫契刻，与三千年前的文字对话</p>
      <hr class="ink-divider" />
    </div>

    <!-- 输入区域 -->
    <section class="input-section">
      <div class="textarea-wrap">
        <textarea
          v-model="inputText"
          placeholder="写下你想契刻的文字，如「日月星辰」「风雨雷电」..."
          maxlength="60"
          class="input-textarea"
          autofocus
        ></textarea>
        <div class="char-counter" :class="{ full: inputText.length >= 60 }">
          {{ inputText.length }} / 60
        </div>
      </div>
      <div class="preset-section">
        <span class="preset-label">快选：</span>
        <button v-for="pt in presets" :key="pt" class="preset-btn" @click="inputText = pt; scheduleDraw()">{{ pt }}</button>
      </div>
    </section>

    <!-- 载体与排版设置 -->
    <section class="toolbar" v-if="inputText.length > 0">
      <div class="toolbar-group">
        <span class="toolbar-label">载体</span>
        <button v-for="s in styles" :key="s.key"
          :class="{ active: currentStyle === s.key }"
          @click="currentStyle = s.key; redraw()">
          <span class="style-icon">{{ s.icon }}</span>{{ s.label }}
        </button>
      </div>
      <div class="toolbar-group">
        <span class="toolbar-label">排版</span>
        <button :class="{ active: isVertical }" @click="isVertical = true; redraw()">竖排</button>
        <button :class="{ active: !isVertical }" @click="isVertical = false; redraw()">横排</button>
      </div>
      <button class="btn-ink export-btn" @click="exportPNG">下载图片</button>
    </section>

    <!-- 画布 -->
    <section class="canvas-section" v-if="inputText.length > 0">
      <div class="canvas-wrap" ref="wrapRef">
        <canvas ref="canvasRef"></canvas>
      </div>
      <div class="canvas-hint">甲骨已收录 {{ includedChars.length }} / {{ totalChars.length }} 字</div>
    </section>

    <!-- 空状态 -->
    <section class="empty-state" v-else>
      <div class="empty-card">
        <div class="empty-seal">契</div>
        <p>在上方输入文字，即刻生成你的甲骨契刻作品</p>
        <p class="empty-sub">收录了 {{ oracleMap.size }} 个甲骨文字，动手试试吧</p>
      </div>
    </section>

    <!-- 底部说明 -->
    <section class="about-section">
      <div class="about-card">
        <p class="about-text">
          甲骨文主要契刻于龟甲和兽骨之上，刀笔之间承载着三千年前殷商先民的问卜与记忆。
          本临摹台让你亲手「契刻」属于自己的甲骨文字，体验古老文字之美。
        </p>
        <p class="about-note">
          * 仅供趣味体验，非严谨学术工具。未收录的汉字将以问号替代。
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

// ====== 数据（与字典页共享同一份47字数据） ======
interface OracleEntry { char: string; meaning: string; category: string; desc: string }

const inputText = ref('')

const presets = [
  '\u65E5\u6708\u6C34\u706B',   // 日月水火
  '\u5C71\u6C34\u98CE\u96E8',   // 山水风雨
  '\u51FA\u5165\u4E0A\u4E0B',   // 出入上下
  '\u725B\u9A6C\u7F8A\u72AC',   // 牛马羊犬
  '\u9C7C\u9E1F\u864E\u9E7F',   // 鱼鸟虎鹿
  '\u738B\u81E3\u5B50\u5973',   // 王臣子女
  '\u9F99\u864E\u98CE\u96E8',   // 龙虎风雨
]

const oracleEntries: OracleEntry[] = [
  { char: '\u65E5', meaning: '日', category: '象形字', desc: '外圆象太阳之形，中一点象光。' },
  { char: '\u6708', meaning: '月', category: '象形字', desc: '象半月之形，缺而不满。' },
  { char: '\u4EBA', meaning: '人', category: '象形字', desc: '象人侧立垂臂之形。' },
  { char: '\u5927', meaning: '大', category: '象形字', desc: '象人正面站立、张开双臂之形。' },
  { char: '\u5929', meaning: '天', category: '会意字', desc: '从大从一，一人头顶之上即为天。' },
  { char: '\u96E8', meaning: '雨', category: '象形字', desc: '上象云层，下象雨滴下落之形。' },
  { char: '\u5C71', meaning: '山', category: '象形字', desc: '三峰并立，象山脉连绵起伏之形。' },
  { char: '\u6C34', meaning: '水', category: '象形字', desc: '中间主流水流，两旁水花飞溅。' },
  { char: '\u706B', meaning: '火', category: '象形字', desc: '象火焰上腾之形，下宽上尖。' },
  { char: '\u6728', meaning: '木', category: '象形字', desc: '上象枝桠，中象树干，下象根须。' },
  { char: '\u738B', meaning: '王', category: '象形字', desc: '象斧钺之形，斧钺是王权的象征。' },
  { char: '\u5B50', meaning: '子', category: '象形字', desc: '象婴儿之形，大头、双臂、身体包裹。' },
  { char: '\u9F99', meaning: '龙', category: '象形字', desc: '象龙之形，有角冠、巨口、长身卷尾。' },
  { char: '\u98CE', meaning: '风', category: '形声字', desc: '从虫凡声。四方风各有专名。' },
  { char: '\u4E0A', meaning: '上', category: '指事字', desc: '以长横为基准，上方短横指示上。' },
  { char: '\u4E0B', meaning: '下', category: '指事字', desc: '以长横为基准，下方短横指示下。' },
  { char: '\u571F', meaning: '土', category: '象形字', desc: '象地上土块之形，一横为地面。' },
  { char: '\u5973', meaning: '女', category: '象形字', desc: '象女子跪坐交手之形。' },
  { char: '\u4E2D', meaning: '中', category: '指事字', desc: '一竖贯穿中部，表示正中。' },
  { char: '\u98DF', meaning: '食', category: '会意字', desc: '上为口，下为盛食物的器皿。' },
  { char: '\u5FC3', meaning: '心', category: '象形字', desc: '象心脏之形，内分左右心房。' },
  { char: '\u9C7C', meaning: '鱼', category: '象形字', desc: '象鱼之形，有头、身、鳞、尾。' },
  { char: '\u9E1F', meaning: '鸟', category: '象形字', desc: '象鸟之形，有喙、头、身、翅、尾、爪。' },
  { char: '\u864E', meaning: '虎', category: '象形字', desc: '象虎侧视之形，大口、利齿、斑纹。' },
  { char: '\u9E7F', meaning: '鹿', category: '象形字', desc: '象鹿侧视之形，有角、头、身、足。' },
  { char: '\u725B', meaning: '牛', category: '象形字', desc: '象牛首正面之形，双角向上弯曲。' },
  { char: '\u7F8A', meaning: '羊', category: '象形字', desc: '象羊首正面之形，角向下弯曲。' },
  { char: '\u9A6C', meaning: '马', category: '象形字', desc: '象马侧视之形，突出长脸、鬃毛。' },
  { char: '\u72AC', meaning: '犬', category: '象形字', desc: '象犬侧视张口之形。' },
  { char: '\u7530', meaning: '田', category: '象形字', desc: '象纵横交错的田界。' },
  { char: '\u79BE', meaning: '禾', category: '象形字', desc: '上象谷穗下垂，下象根茎。' },
  { char: '\u9EC4', meaning: '黄', category: '会意字', desc: '一说象佩玉璜之形。' },
  { char: '\u767D', meaning: '白', category: '象形字', desc: '一说象米粒之形。亦是伯的初文。' },
  { char: '\u8D64', meaning: '赤', category: '会意字', desc: '从大从火，大火之色为赤。' },
  { char: '\u8840', meaning: '血', category: '指事字', desc: '器皿中有一圆点表示血液。' },
  { char: '\u81E3', meaning: '臣', category: '象形字', desc: '象竖目之形，屈身俯首之状。' },
  { char: '\u76EE', meaning: '目', category: '象形字', desc: '象人眼之形，外框为眼眶，内为瞳仁。' },
  { char: '\u8033', meaning: '耳', category: '象形字', desc: '象耳朵轮廓之形。' },
  { char: '\u53E3', meaning: '口', category: '象形字', desc: '象人口张开之形。' },
  { char: '\u6B62', meaning: '止', category: '象形字', desc: '象脚掌和脚趾之形。' },
  { char: '\u884C', meaning: '行', category: '象形字', desc: '象十字路口之形，本义为道路。' },
  { char: '\u6765', meaning: '来', category: '假借字', desc: '本象麦穗之形，借为往来之来。' },
  { char: '\u51FA', meaning: '出', category: '会意字', desc: '从止从凵，脚从坑中跨出。' },
  { char: '\u5165', meaning: '入', category: '象形字', desc: '象尖锐物进入之形。' },
  { char: '\u4E00', meaning: '一', category: '指事字', desc: '以一道横画表示数目一。' },
  { char: '\u4E94', meaning: '五', category: '指事字', desc: '甲骨文五作X形交叉。' },
  { char: '\u5341', meaning: '十', category: '指事字', desc: '以一竖画表示数目十。' },
]

const oracleMap = new Map<string, OracleEntry>()
oracleEntries.forEach(e => oracleMap.set(e.char, e))

const ORACLE_CHAR_MAP: Record<string, string> = {
  '\u9F99': '\u9F8D', '\u98CE': '\u98A8', '\u9C7C': '\u9B5A',
  '\u9E1F': '\u9CE5', '\u9A6C': '\u99AC', '\u6765': '\u4F86', '\u9EC4': '\u9EC3',
}

function toOracleChar(ch: string): string { return ORACLE_CHAR_MAP[ch] || ch }

// ====== 画布逻辑 ======
const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLElement | null>(null)
const currentStyle = ref<'turtle' | 'bone' | 'bamboo' | 'paper'>('turtle')
const isVertical = ref(true)

const styles = [
  { key: 'turtle' as const, label: '龟甲', icon: '\u{1F422}' },
  { key: 'bone' as const, label: '兽骨', icon: '\u{1F9B4}' },
  { key: 'bamboo' as const, label: '竹简', icon: '\u{1F38D}' },
  { key: 'paper' as const, label: '宣纸', icon: '\u{1F4C4}' },
]

const totalChars = computed(() => inputText.value.split('').filter(ch => ch.trim()))
const includedChars = computed(() => totalChars.value.filter(ch => oracleMap.has(ch)))

let drawTimer = 0

function scheduleDraw() {
  clearTimeout(drawTimer)
  drawTimer = window.setTimeout(redraw, 100)
}

watch(inputText, scheduleDraw)
watch([currentStyle, isVertical], () => { nextTick(redraw) })

function getCanvasSize() {
  const wrap = wrapRef.value
  const w = wrap ? wrap.clientWidth : 760
  const h = isVertical.value ? Math.max(420, w * 0.75) : Math.max(280, w * 0.45)
  return { w: Math.floor(w), h: Math.floor(h) }
}

async function redraw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const { w, h } = getCanvasSize()
  const dpr = 2
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'

  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const chars = totalChars.value
  if (chars.length === 0) {
    drawEmptyCanvas(ctx, w, h)
    return
  }

  drawBackground(ctx, w, h)
  drawCharacters(ctx, w, h, chars)
  drawSeal(ctx, w, h)
  drawFrame(ctx, w, h)
}

function drawEmptyCanvas(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawBackground(ctx, w, h)
  drawFrame(ctx, w, h)
  ctx.fillStyle = 'rgba(139,119,80,0.25)'
  ctx.font = '28px "KaiTi","STKaiti",serif'
  ctx.textAlign = 'center'
  ctx.fillText('等待契刻...', w / 2, h / 2)
}

// ====== 背景纹理 ======
function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  switch (currentStyle.value) {
    case 'turtle': drawTurtleBG(ctx, w, h); break
    case 'bone': drawBoneBG(ctx, w, h); break
    case 'bamboo': drawBambooBG(ctx, w, h); break
    case 'paper': drawPaperBG(ctx, w, h); break
  }
}

function drawTurtleBG(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#e8d5a3')
  grad.addColorStop(0.3, '#dcc89a')
  grad.addColorStop(0.6, '#d4be8a')
  grad.addColorStop(1, '#c9b078')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 龟甲裂纹
  ctx.strokeStyle = 'rgba(120,90,40,0.18)'
  ctx.lineWidth = 1
  for (let i = 0; i < 12; i++) {
    ctx.beginPath()
    const x = w * (0.15 + Math.random() * 0.7)
    const y = h * (0.1 + Math.random() * 0.8)
    ctx.moveTo(x, y)
    let cx = x, cy = y
    for (let j = 0; j < 6; j++) {
      cx += (Math.random() - 0.5) * w * 0.25
      cy += (Math.random() - 0.5) * h * 0.2
      ctx.lineTo(cx, cy)
    }
    ctx.stroke()
  }

  // 斑点
  ctx.fillStyle = 'rgba(100,70,30,0.06)'
  for (let i = 0; i < 40; i++) {
    ctx.beginPath()
    ctx.arc(w * Math.random(), h * Math.random(), 2 + Math.random() * 6, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawBoneBG(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#f5f0e8')
  grad.addColorStop(0.5, '#ede4d5')
  grad.addColorStop(1, '#e8ddc8')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 骨质纹理
  ctx.strokeStyle = 'rgba(160,140,110,0.12)'
  ctx.lineWidth = 0.5
  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    let y = h * (0.05 + i * 0.045)
    ctx.moveTo(0, y)
    for (let x = 0; x < w; x += 20) {
      ctx.lineTo(x, y + (Math.sin(x * 0.01 + i) * 3))
    }
    ctx.stroke()
  }
  // 微孔
  ctx.fillStyle = 'rgba(120,100,70,0.08)'
  for (let i = 0; i < 60; i++) {
    ctx.beginPath()
    ctx.arc(w * Math.random(), h * Math.random(), 0.5 + Math.random() * 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawBambooBG(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#d4c5a0'
  ctx.fillRect(0, 0, w, h)

  const slipW = w / 7
  for (let i = 0; i < 7; i++) {
    const x = i * slipW
    const grad = ctx.createLinearGradient(x, 0, x + slipW, 0)
    const shade = 0.82 + Math.random() * 0.15
    grad.addColorStop(0, `rgba(180,160,120,0.3)`)
    grad.addColorStop(0.2, `rgba(220,200,155,${shade})`)
    grad.addColorStop(0.8, `rgba(210,190,145,${shade})`)
    grad.addColorStop(1, `rgba(160,140,100,0.3)`)
    ctx.fillStyle = grad
    ctx.fillRect(x + 2, 0, slipW - 4, h)
    // 简间线
    ctx.strokeStyle = 'rgba(100,70,30,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  // 编绳
  const ropeY = [h * 0.15, h * 0.85]
  ropeY.forEach(y => {
    ctx.strokeStyle = 'rgba(140,100,50,0.35)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x < w; x += 3) {
      ctx.lineTo(x, y + Math.sin(x * 0.08) * 1.5)
    }
    ctx.stroke()
  })
}

function drawPaperBG(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#faf6ed')
  grad.addColorStop(0.5, '#f5efde')
  grad.addColorStop(1, '#efe5ce')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 纤维纹理
  ctx.strokeStyle = 'rgba(180,160,120,0.06)'
  ctx.lineWidth = 0.5
  for (let i = 0; i < 200; i++) {
    ctx.beginPath()
    let x = w * Math.random(), y = h * Math.random()
    ctx.moveTo(x, y)
    ctx.lineTo(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 8)
    ctx.stroke()
  }
}

// ====== 文字渲染 ======
function drawCharacters(ctx: CanvasRenderingContext2D, w: number, h: number, chars: string[]) {
  const margin = 40
  const areaW = w - margin * 2
  const areaH = h - margin * 2

  if (isVertical.value) {
    drawVertical(ctx, chars, margin, margin, areaW, areaH)
  } else {
    drawHorizontal(ctx, chars, margin, margin, areaW, areaH)
  }
}

function drawVertical(ctx: CanvasRenderingContext2D, chars: string[], x0: number, y0: number, aw: number, ah: number) {
  const cols = Math.max(1, Math.min(8, Math.ceil(chars.length / 3)))
  const rows = Math.ceil(chars.length / cols)
  const cellW = aw / cols
  const cellH = Math.min(ah / rows, cellW * 1.3)
  const fontSize = Math.min(cellW * 0.7, cellH * 0.75, 72)

  ctx.font = `${fontSize}px "OracleBone","KaiTi","STKaiti",serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 竖排：从右向左，每列从上到下
  let idx = 0
  for (let col = cols - 1; col >= 0 && idx < chars.length; col--) {
    for (let row = 0; row < rows && idx < chars.length; row++) {
      const cx = x0 + col * cellW + cellW / 2
      const cy = y0 + row * cellH + cellH / 2
      const ch = chars[idx]

      if (oracleMap.has(ch)) {
        const oracleCh = toOracleChar(ch)
        // 墨色渐变
        ctx.fillStyle = '#2d2010'
        ctx.fillText(oracleCh, cx, cy)
      } else {
        ctx.fillStyle = 'rgba(180,160,120,0.4)'
        ctx.font = `${fontSize * 0.6}px "KaiTi","STKaiti",serif`
        ctx.fillText('?', cx, cy)
        ctx.font = `${fontSize}px "OracleBone","KaiTi","STKaiti",serif`
      }
      idx++
    }
  }

  // 竖排分隔线
  ctx.strokeStyle = 'rgba(139,119,80,0.12)'
  ctx.lineWidth = 0.5
  ctx.setLineDash([4, 8])
  for (let col = 0; col < cols - 1; col++) {
    const x = x0 + (col + 1) * cellW
    ctx.beginPath()
    ctx.moveTo(x, y0)
    ctx.lineTo(x, y0 + rows * cellH)
    ctx.stroke()
  }
  ctx.setLineDash([])
}

function drawHorizontal(ctx: CanvasRenderingContext2D, chars: string[], x0: number, y0: number, aw: number, ah: number) {
  const cols = Math.min(chars.length, 8)
  const rows = Math.ceil(chars.length / cols)
  const cellW = aw / cols
  const cellH = Math.min(ah / Math.max(rows, 1), cellW * 1.3)
  const fontSize = Math.min(cellW * 0.65, cellH * 0.7, 68)

  ctx.font = `${fontSize}px "OracleBone","KaiTi","STKaiti",serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  let idx = 0
  for (let row = 0; row < rows && idx < chars.length; row++) {
    for (let col = 0; col < cols && idx < chars.length; col++) {
      const cx = x0 + col * cellW + cellW / 2
      const cy = y0 + row * cellH + cellH / 2
      const ch = chars[idx]

      if (oracleMap.has(ch)) {
        ctx.fillStyle = '#2d2010'
        ctx.fillText(toOracleChar(ch), cx, cy)
      } else {
        ctx.fillStyle = 'rgba(180,160,120,0.4)'
        ctx.font = `${fontSize * 0.6}px "KaiTi","STKaiti",serif`
        ctx.fillText('?', cx, cy)
        ctx.font = `${fontSize}px "OracleBone","KaiTi","STKaiti",serif`
      }
      idx++
    }
  }
}

// ====== 印章 ======
function drawSeal(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sealSize = 42
  const sx = w - sealSize - 24
  const sy = h - sealSize - 18

  ctx.save()
  ctx.translate(sx + sealSize / 2, sy + sealSize / 2)
  ctx.rotate(-0.08)

  // 印框
  ctx.strokeStyle = '#b5302a'
  ctx.lineWidth = 2.5
  ctx.strokeRect(-sealSize / 2, -sealSize / 2, sealSize, sealSize)

  // 印文（竖排两列）
  ctx.fillStyle = '#b5302a'
  ctx.font = 'bold 16px "KaiTi","STKaiti",serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('竹下', -sealSize / 4, 0)
  ctx.fillText('问甲', sealSize / 4, 0)

  ctx.restore()
}

// ====== 边框 ======
function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const m = 14
  ctx.strokeStyle = 'rgba(139,119,80,0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(m, m, w - m * 2, h - m * 2)

  // 四角装饰
  const cl = 18
  ctx.lineWidth = 2
  const corners = [
    { x: m, y: m, dx: 1, dy: 1 },
    { x: w - m, y: m, dx: -1, dy: 1 },
    { x: m, y: h - m, dx: 1, dy: -1 },
    { x: w - m, y: h - m, dx: -1, dy: -1 },
  ]
  corners.forEach(c => {
    ctx.beginPath()
    ctx.moveTo(c.x, c.y + c.dy * cl)
    ctx.lineTo(c.x, c.y)
    ctx.lineTo(c.x + c.dx * cl, c.y)
    ctx.stroke()
  })
}

// ====== 导出 ======
function exportPNG() {
  const canvas = canvasRef.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = '甲骨契刻_' + Date.now() + '.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

onMounted(() => { nextTick(redraw) })
window.addEventListener('resize', redraw)
onUnmounted(() => { window.removeEventListener('resize', redraw) })
</script>

<style scoped>
.studio-page{max-width:860px;margin:0 auto;padding:0 20px 60px}

/* 输入 */
.input-section{margin-top:10px}
.textarea-wrap{position:relative;max-width:700px;margin:0 auto}
.input-textarea{width:100%;height:100px;padding:18px 20px;background:#fff;border:2px solid var(--paper-dark);border-radius:var(--radius-lg);font-size:1.05rem;font-family:inherit;line-height:1.8;color:var(--ink);resize:vertical;outline:none;box-sizing:border-box;box-shadow:var(--shadow);transition:border-color .3s,box-shadow .3s}
.input-textarea:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(184,134,11,.08)}
.input-textarea::placeholder{color:var(--ink-wash);opacity:.4;font-family:'KaiTi','STKaiti',serif;letter-spacing:1px}
.char-counter{position:absolute;bottom:10px;right:14px;font-size:.78rem;color:var(--ink-wash);letter-spacing:1px;background:rgba(255,255,255,.85);padding:2px 10px;border-radius:var(--radius);transition:color .3s}
.char-counter.full{color:var(--cinnabar)}
.preset-section{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;flex-wrap:wrap}
.preset-label{font-size:.82rem;color:var(--ink-wash);letter-spacing:1px;margin-right:2px}
.preset-btn{background:var(--paper);border:1px solid var(--paper-dark);color:var(--ink-light);font-family:'KaiTi','STKaiti',serif;font-size:.88rem;letter-spacing:2px;padding:6px 14px;cursor:pointer;border-radius:var(--radius);transition:all .25s ease}
.preset-btn:hover{background:var(--gold);color:#fff;border-color:var(--gold);transform:translateY(-1px);box-shadow:0 3px 12px rgba(184,134,11,.2)}

/* 工具栏 */
.toolbar{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:16px;margin-top:24px;padding:16px 0}
.toolbar-group{display:flex;align-items:center;gap:6px}
.toolbar-label{font-size:.8rem;color:var(--ink-wash);letter-spacing:1px;margin-right:4px}
.toolbar button,.toolbar-group button{padding:6px 14px;background:var(--paper);border:1px solid var(--paper-dark);color:var(--ink-wash);font-size:.82rem;font-family:inherit;letter-spacing:1px;cursor:pointer;border-radius:var(--radius);transition:all .25s ease}
.toolbar button:hover,.toolbar-group button:hover{border-color:var(--gold);color:var(--gold)}
.toolbar button.active,.toolbar-group button.active{background:var(--ink);color:var(--paper-light);border-color:var(--ink)}
.style-icon{font-size:1rem;margin-right:3px}
.export-btn{padding:8px 22px!important;font-size:.88rem!important;letter-spacing:2px!important}

/* 画布 */
.canvas-section{margin-top:20px}
.canvas-wrap{background:#fff;border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);overflow:hidden;border:1px solid var(--paper-dark)}
.canvas-wrap canvas{display:block;width:100%;height:auto}
.canvas-hint{text-align:center;font-size:.78rem;color:var(--ink-wash);letter-spacing:1px;margin-top:10px}

/* 空状态 */
.empty-state{display:flex;justify-content:center;padding:50px 20px}
.empty-card{text-align:center;max-width:380px;padding:44px 32px;background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);box-shadow:var(--shadow)}
.empty-seal{display:inline-flex;width:64px;height:64px;align-items:center;justify-content:center;border:2px solid var(--gold-pale);color:var(--gold-pale);font-family:'KaiTi','STKaiti',serif;font-size:28px;margin-bottom:18px;transform:rotate(-6deg)}
.empty-card:hover .empty-seal{border-color:var(--gold);color:var(--gold);transform:rotate(0deg)}
.empty-card p{font-size:.95rem;color:var(--ink-light);letter-spacing:1px;margin-bottom:6px}
.empty-sub{font-size:.82rem!important;color:var(--ink-wash)!important}

/* 底部说明 */
.about-section{margin-top:40px}
.about-card{max-width:700px;margin:0 auto;background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:28px 32px;box-shadow:var(--shadow)}
.about-text{font-size:.9rem;color:var(--ink);line-height:2;letter-spacing:.5px;text-indent:2em;margin-bottom:12px}
.about-note{font-size:.8rem;color:var(--ink-wash);line-height:1.8;border-left:3px solid var(--gold-pale);padding-left:14px;background:var(--paper);padding:10px 14px}

@media(max-width:600px){
  .input-textarea{height:90px;font-size:.95rem;padding:14px 16px}
  .toolbar{gap:10px}
  .toolbar button,.toolbar-group button{padding:5px 10px;font-size:.76rem}
  .about-card{padding:20px 18px}
}
</style>
