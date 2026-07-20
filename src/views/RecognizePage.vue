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
          <button class="btn-ink" @click="startRecognize" :disabled="recognizing">{{ recognizing ? '辨识中...' : '开始识甲' }}</button>
          <button class="btn-outline" @click="reset">重新上传</button>
        </div>
      </div>
    </div>
    <div v-if="recognizing" class="recognizing-banner">
      <div class="ink-loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      <p>正在辨识甲骨文字...</p>
    </div>
    <div v-if="result" class="result-section">
      <div class="result-card">
        <div class="result-seal-wrap"><div class="result-char">{{ result.char }}</div><div class="result-stamp">已识</div></div>
        <div class="result-body">
          <div class="result-row"><span class="result-label">识别文字</span><span class="result-value char-highlight">{{ result.char }}</span></div>
          <div class="result-row"><span class="result-label">释义</span><span class="result-value">{{ result.meaning }}</span></div>
          <div class="result-row"><span class="result-label">字型类别</span><span class="result-value">{{ result.type }}</span></div>
          <div class="result-row"><span class="result-label">置信度</span><span class="result-value confidence">{{ result.confidence }}%</span></div>
        </div>
      </div>
      <div class="result-actions">
        <button class="btn-gold" @click="copyResult">{{ copied ? '已复制!' : '复制结果' }}</button>
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
import { ref } from 'vue'
const fileInput = ref<HTMLInputElement>()
const previewUrl = ref('')
const recognizing = ref(false)
const copied = ref(false)
const result = ref<{ char: string; meaning: string; type: string; confidence: number } | null>(null)
function triggerUpload() { fileInput.value?.click() }
function handleFile(e: Event) { const f = (e.target as HTMLInputElement).files; if (f?.length) { previewUrl.value = URL.createObjectURL(f[0]); result.value = null } }
function handleDrop(e: DragEvent) { const f = e.dataTransfer?.files; if (f?.length) { previewUrl.value = URL.createObjectURL(f[0]); result.value = null } }
function reset() { previewUrl.value = ''; result.value = null; copied.value = false }
function copyResult() { if (result.value) { const t = result.value.char + ' - ' + result.value.meaning + ' (' + result.value.type + ', ' + result.value.confidence + '%)'; navigator.clipboard?.writeText(t).then(() => { copied.value = true; setTimeout(() => copied.value = false, 2000) }).catch(() => { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); copied.value = true; setTimeout(() => copied.value = false, 2000) }) } }
function startRecognize() {
  recognizing.value = true; result.value = null
  setTimeout(() => {
    const c = [{ char: '日', meaning: '太阳、白天、日期', type: '象形字', confidence: 96.5 },{ char: '月', meaning: '月亮、月份、夜晚', type: '象形字', confidence: 94.2 },{ char: '人', meaning: '人类、人们', type: '象形字', confidence: 97.8 },{ char: '大', meaning: '大的、伟大', type: '象形字', confidence: 93.1 }]
    result.value = c[Math.floor(Math.random() * c.length)]; recognizing.value = false
  }, 1800)
}
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
.recognizing-banner{text-align:center;padding:30px 0}
.ink-loading{display:flex;gap:8px;justify-content:center;margin-bottom:12px}
.ink-loading .dot{width:8px;height:8px;background:var(--gold);border-radius:50%;animation:inkPulse 1.4s ease-in-out infinite}
.ink-loading .dot:nth-child(2){animation-delay:.2s}.ink-loading .dot:nth-child(3){animation-delay:.4s}
@keyframes inkPulse{0%,80%,100%{opacity:.3;transform:scale(1)}40%{opacity:1;transform:scale(1.3)}}
.recognizing-banner p{color:var(--ink-wash);font-size:.9rem;letter-spacing:2px}
.result-section{margin-top:30px}
.result-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:32px;display:flex;gap:32px;align-items:center;box-shadow:var(--shadow)}
.result-seal-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;flex-shrink:0;min-width:110px}
.result-char{font-family:'KaiTi','STKaiti',serif;font-size:72px;color:var(--ink);line-height:1}
.result-stamp{font-size:12px;color:var(--cinnabar-light);border:1px solid var(--cinnabar-light);padding:2px 10px;font-family:'KaiTi','STKaiti',serif;letter-spacing:2px}
.result-body{flex:1}
.result-row{display:flex;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--paper)}
.result-row:last-child{border-bottom:none}
.result-label{font-size:.85rem;color:var(--ink-wash);min-width:80px;letter-spacing:1px}
.result-value{font-size:1rem;color:var(--ink);letter-spacing:1px}
.char-highlight{font-family:'KaiTi','STKaiti',serif;font-size:1.3rem;color:var(--ink)}
.confidence{color:var(--jade)!important;font-weight:bold}
.result-actions{display:flex;justify-content:center;margin-top:16px}
.tips-section{margin-top:40px}
.tips-card{background:var(--paper);border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:20px 24px}
.tips-card h4{font-size:.95rem;color:var(--gold);letter-spacing:2px;margin-bottom:12px}
.tips-card li{font-size:.85rem;color:var(--ink-wash);margin:6px 0;padding-left:4px}
@media(max-width:600px){.result-card{flex-direction:column;text-align:center}.result-row{flex-direction:column;gap:4px;text-align:center}}
</style>
