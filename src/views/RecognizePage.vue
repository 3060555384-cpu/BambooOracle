<template>
  <div class="recognize-page">
    <div class="page-header">
      <h1>识甲</h1>
      <p>上传甲骨拓片或单字图片，AI 自动辨识文字</p>
      <hr class="ink-divider" />
    </div>
    <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop" :class="{ 'has-image': previewUrl }">
      <input type="file" ref="fileInput" accept="image/*" @change="handleFile" style="display:none" />
      <div v-if="!previewUrl" class="upload-placeholder" @click="triggerUpload">
        <div class="upload-frame">
          <div class="upload-seal">甲</div>
          <p class="upload-hint">点击或拖拽图片至此处</p>
          <p class="upload-sub">支持 JPG / PNG / WEBP 格式</p>
        </div>
      </div>
      <div v-else class="preview-section">
        <img :src="previewUrl" class="preview-img" alt="preview" />
        <div class="preview-actions">
          <button class="btn-ink" @click="startRecognize" :disabled="recognizing">
            <span v-if="recognizing" class="btn-spinner"></span>
            {{ recognizing ? '辨识中...' : '开始识甲' }}
          </button>
          <button class="btn-outline" @click="reset">重新上传</button>
        </div>
      </div>
    </div>
    <div v-if="recognizing" class="recognizing-banner">
      <div class="recognize-progress">
        <div class="progress-bar"><div class="progress-fill"></div></div>
        <p class="progress-text">{{ progressText }}</p>
      </div>
    </div>
    <div v-if="results.length > 0" class="results-section">
      <div class="results-summary">
        <span class="summary-icon">&#10003;</span>
        共识别出 <strong>{{ results.length }}</strong> 个甲骨文字 &middot; 耗时 {{ elapsed }}s
      </div>
      <div v-for="(r, i) in results" :key="i" class="result-card" :style="{ animationDelay: (i * 0.15) + 's' }">
        <div class="result-rank">{{ i + 1 }}</div>
        <div class="result-char-wrap"><div class="result-char">{{ r.char }}</div><div class="result-stamp">已识</div></div>
        <div class="result-body">
          <div class="result-row"><span class="result-label">释义</span><span class="result-value">{{ r.meaning }}</span></div>
          <div class="result-row"><span class="result-label">字型</span><span class="result-value">{{ r.type }}</span></div>
          <div class="result-row"><span class="result-label">置信度</span><span class="result-value confidence-wrap"><span class="confidence-bar"><span class="confidence-fill" :style="{ width: r.confidence + '%' }" :class="confidenceClass(r.confidence)"></span></span><span class="confidence-num">{{ r.confidence }}%</span></span></div>
        </div>
      </div>
      <div class="result-actions">
        <button class="btn-gold" @click="copyAllResults">{{ copied ? '已复制!' : '复制全部结果' }}</button>
      </div>
    </div>
    <div v-if="history.length > 0" class="history-section">
      <h3 class="section-title">识别历史</h3>
      <div class="history-list">
        <div v-for="(h, i) in history" :key="i" class="history-item">
          <span class="history-chars">{{ h.chars.join('') }}</span>
          <span class="history-time">{{ h.time }}</span>
          <button class="history-del" @click="history.splice(i,1)" title="删除">&times;</button>
        </div>
      </div>
    </div>
    <div class="tips-section">
      <div class="tips-card">
        <h4>识甲技巧</h4>
        <ul><li>确保图片清晰，光照均匀</li><li>单字识别时尽量裁剪至仅含一字</li><li>拓片图片建议先做二值化处理</li><li>支持同时识别多个文字</li></ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface RecogResult { char: string; meaning: string; type: string; confidence: number }
interface RecogHistory { chars: string[]; time: string }

const fileInput = ref<HTMLInputElement>()
const previewUrl = ref('')
const recognizing = ref(false)
const copied = ref(false)
const elapsed = ref(0)
const progressText = ref('正在加载模型...')
const results = ref<RecogResult[]>([])
const history = ref<RecogHistory[]>([])

let recogTimer = 0
let progressTimer = 0

const mockPool: RecogResult[] = [
  { char: '日', meaning: '太阳、白天、日期', type: '象形字', confidence: 96.5 },
  { char: '月', meaning: '月亮、月份、夜晚', type: '象形字', confidence: 94.2 },
  { char: '人', meaning: '人类、人们', type: '象形字', confidence: 97.8 },
  { char: '大', meaning: '大的、伟大', type: '象形字', confidence: 93.1 },
  { char: '天', meaning: '天空、上天、天帝', type: '会意字', confidence: 91.7 },
  { char: '雨', meaning: '雨水、降雨', type: '象形字', confidence: 95.3 },
  { char: '山', meaning: '山峰、山脉', type: '象形字', confidence: 98.2 },
  { char: '水', meaning: '水流、河流', type: '象形字', confidence: 92.4 },
  { char: '火', meaning: '火焰、大火星', type: '象形字', confidence: 89.6 },
  { char: '木', meaning: '树木、木材', type: '象形字', confidence: 94.8 },
  { char: '王', meaning: '首领、商王', type: '象形字', confidence: 97.1 },
  { char: '子', meaning: '子女、地支之首', type: '象形字', confidence: 96.3 },
  { char: '龙', meaning: '神兽、司雨之神', type: '象形字', confidence: 88.5 },
  { char: '风', meaning: '风雨之风', type: '形声字', confidence: 85.9 },
  { char: '上', meaning: '上方、上天', type: '指事字', confidence: 99.1 },
  { char: '下', meaning: '下方、下降', type: '指事字', confidence: 98.7 },
  { char: '土', meaning: '土地、社神', type: '象形字', confidence: 95.4 },
  { char: '女', meaning: '女性、配偶', type: '象形字', confidence: 93.8 },
  { char: '中', meaning: '中央、中等', type: '指事字', confidence: 97.5 },
  { char: '食', meaning: '食物、食用', type: '会意字', confidence: 90.2 },
]

const progressSteps = ['正在加载模型...', '正在预处理图片...', '正在提取特征...', '正在进行字符匹配...', '正在生成结果...']

function triggerUpload() { fileInput.value?.click() }
function handleFile(e: Event) { const f = (e.target as HTMLInputElement).files; if (f?.length) { loadImage(f[0]) } }
function handleDrop(e: DragEvent) { const f = e.dataTransfer?.files; if (f?.length && f[0].type.startsWith('image/')) { loadImage(f[0]) } }

function loadImage(file: File) {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  results.value = []
}

function reset() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  results.value = []
  copied.value = false
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t }
  return a
}

function confidenceClass(v: number) {
  if (v >= 95) return 'high'
  if (v >= 85) return 'mid'
  return 'low'
}

function startRecognize() {
  recognizing.value = true
  results.value = []
  copied.value = false
  elapsed.value = 0
  let stepIdx = 0

  progressText.value = progressSteps[0]
  progressTimer = window.setInterval(() => {
    stepIdx++
    if (stepIdx < progressSteps.length) progressText.value = progressSteps[stepIdx]
  }, 400)

  const startTime = performance.now()
  recogTimer = window.setTimeout(() => {
    clearInterval(progressTimer)
    const count = 1 + Math.floor(Math.random() * 3)
    const picked = shuffle(mockPool).slice(0, count)
      .map(r => ({ ...r, confidence: +(r.confidence - Math.random() * 5).toFixed(1) }))
    results.value = picked
    elapsed.value = +((performance.now() - startTime) / 1000).toFixed(1)
    recognizing.value = false

    history.value.unshift({
      chars: picked.map(r => r.char),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })
    if (history.value.length > 20) history.value.pop()
  }, 2200) as unknown as number
}

function copyAllResults() {
  const text = results.value.map(r => r.char + ' - ' + r.meaning + ' (' + r.type + ', ' + r.confidence + '%)').join('\n')
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => { copied.value = true; setTimeout(() => copied.value = false, 2000) })
  } else {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}

onUnmounted(() => {
  if (recogTimer) clearTimeout(recogTimer)
  if (progressTimer) clearInterval(progressTimer)
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<style scoped>
.recognize-page{max-width:800px;margin:0 auto;padding:0 20px 60px}
.upload-area{background:#fff;border:2px dashed var(--gold-pale);border-radius:var(--radius-lg);padding:60px 20px;text-align:center;min-height:240px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s ease}
.upload-area:hover{border-color:var(--gold);background:var(--paper-light)}
.upload-area.has-image{border-style:solid;border-color:var(--paper-dark);cursor:default;padding:30px 20px}
.upload-placeholder{width:100%}
.upload-frame{padding:40px}
.upload-seal{display:inline-flex;width:60px;height:60px;align-items:center;justify-content:center;border:2px solid var(--gold-pale);color:var(--gold-pale);font-family:'KaiTi','STKaiti',serif;font-size:26px;margin-bottom:20px;transform:rotate(-5deg)}
.upload-area:hover .upload-seal{border-color:var(--gold);color:var(--gold)}
.upload-hint{font-size:1.05rem;color:var(--ink-light);letter-spacing:2px;margin-bottom:6px}
.upload-sub{font-size:.85rem;color:var(--ink-wash)}
.preview-section{width:100%}
.preview-img{max-width:100%;max-height:300px;border-radius:var(--radius-md);margin-bottom:20px;border:1px solid var(--paper-dark)}
.preview-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;margin-right:6px;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
.recognizing-banner{padding:30px 0}
.recognize-progress{max-width:400px;margin:0 auto;text-align:center}
.progress-bar{height:4px;background:var(--paper-dark);border-radius:2px;overflow:hidden;margin-bottom:12px}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--gold-pale),var(--gold));border-radius:2px;animation:progressAnim 2.2s ease-in-out}
@keyframes progressAnim{0%{width:0}30%{width:35%}70%{width:70%}100%{width:100%}}
.progress-text{font-size:.85rem;color:var(--ink-wash);letter-spacing:1px}
.results-section{margin-top:30px}
.results-summary{text-align:center;margin-bottom:20px;font-size:.95rem;color:var(--ink-light);letter-spacing:1px;animation:fadeIn .5s ease}
.results-summary .summary-icon{color:var(--jade);margin-right:4px}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.result-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:28px 28px 28px 20px;display:flex;gap:24px;align-items:center;box-shadow:var(--shadow);margin-bottom:12px;opacity:0;animation:cardSlide .5s ease forwards}
@keyframes cardSlide{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
.result-card:hover{box-shadow:var(--shadow-md)}
.result-rank{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:var(--ink);color:var(--paper-light);font-size:.8rem;font-weight:bold;border-radius:50%;flex-shrink:0}
.result-char-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;flex-shrink:0;min-width:90px}
.result-char{font-family:'KaiTi','STKaiti',serif;font-size:60px;color:var(--ink);line-height:1}
.result-stamp{font-size:11px;color:var(--cinnabar-light);border:1px solid var(--cinnabar-light);padding:2px 10px;font-family:'KaiTi','STKaiti',serif;letter-spacing:2px}
.result-body{flex:1;min-width:0}
.result-row{display:flex;align-items:center;padding:6px 0;border-bottom:1px solid var(--paper);gap:12px}
.result-row:last-child{border-bottom:none}
.result-label{font-size:.82rem;color:var(--ink-wash);min-width:60px;letter-spacing:1px;flex-shrink:0}
.result-value{font-size:.95rem;color:var(--ink);letter-spacing:1px}
.confidence-wrap{display:flex;align-items:center;gap:10px;flex:1}
.confidence-bar{flex:1;height:6px;background:var(--paper-dark);border-radius:3px;overflow:hidden}
.confidence-fill{height:100%;border-radius:3px;transition:width .6s ease}
.confidence-fill.high{background:var(--jade)}
.confidence-fill.mid{background:var(--gold)}
.confidence-fill.low{background:var(--cinnabar-light)}
.confidence-num{font-size:.85rem;font-weight:bold;min-width:48px}
.result-actions{display:flex;justify-content:center;margin-top:20px;gap:12px}
.history-section{margin-top:40px}
.section-title{font-family:'KaiTi','STKaiti',serif;font-size:1.1rem;color:var(--ink);letter-spacing:3px;margin-bottom:16px;text-align:center}
.history-list{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.history-item{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:6px 12px;font-size:.85rem;color:var(--ink);transition:all .2s}
.history-item:hover{border-color:var(--gold-pale)}
.history-chars{font-family:'KaiTi','STKaiti',serif;font-size:1.1rem;letter-spacing:2px;color:var(--ink)}
.history-time{font-size:.75rem;color:var(--ink-wash)}
.history-del{background:none;border:none;color:var(--ink-wash);cursor:pointer;font-size:1rem;padding:0 2px;line-height:1}
.history-del:hover{color:var(--cinnabar)}
.tips-section{margin-top:40px}
.tips-card{background:var(--paper);border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:20px 24px}
.tips-card h4{font-size:.95rem;color:var(--gold);letter-spacing:2px;margin-bottom:12px}
.tips-card li{font-size:.85rem;color:var(--ink-wash);margin:6px 0;padding-left:4px}
@media(max-width:600px){
  .result-card{flex-direction:column;text-align:center;padding:24px 16px}
  .result-rank{display:none}
  .result-row{flex-direction:column;gap:2px;align-items:center}
  .confidence-wrap{justify-content:center}
}
</style>