<template>
  <div class="recognize-page">
    <div class="page-header">
      <h1>识甲</h1>
      <p>上传甲骨拓片或单字图片，AI 自动辨识文字</p>
      <hr class="ink-divider" />
    </div>

    <div class="upload-zone" :class="{ 'has-image': previewUrl }">
      <div v-if="!previewUrl" class="upload-placeholder">
        <div class="upload-icon">&#x1F4C4;</div>
        <p>点击或拖拽上传甲骨文图片</p>
        <p class="hint">支持 JPG / PNG，建议单字裁剪</p>
        <input type="file" accept="image/*" @change="onFileChange" class="file-input" />
      </div>
      <div v-else class="preview-area">
        <img :src="previewUrl" alt="预览" class="preview-img" />
        <div class="preview-actions">
          <button @click="startRecognize" :disabled="recognizing || modelLoading" class="btn-recognize">
            {{ modelLoading ? '模型加载中...' : recognizing ? '识别中...' : '开始识甲' }}
          </button>
          <button @click="clearImage" class="btn-clear">重新上传</button>
        </div>
      </div>
    </div>

    <div v-if="modelLoading" class="loading-bar">
      <div class="loading-text">正在加载识别模型... {{ modelProgress }}%</div>
      <div class="progress-track"><div class="progress-fill" :style="{ width: modelProgress + '%' }"></div></div>
    </div>

    <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>

    <div v-if="results.length > 0" class="results-section">
      <div class="results-header">
        <h3>识别结果</h3>
        <span class="elapsed" v-if="elapsed > 0">耗时 {{ elapsed }}s</span>
      </div>
      <div class="result-cards">
        <div v-for="(r, i) in results" :key="i" class="result-card" :class="{ primary: i === 0 }">
          <div class="result-char">{{ r.char }}</div>
          <div class="result-info">
            <div class="result-confidence">{{ r.confidence.toFixed(1) }}%</div>
            <div class="result-rank">第{{ i + 1 }}候选</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <div class="tips-card">
        <h4>识甲技巧</h4>
        <ul><li>确保图片清晰，光照均匀</li><li>单字识别时尽量裁剪至仅含一字</li><li>拓片图片建议先做二值化处理</li></ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as ort from 'onnxruntime-web'

// ── 状态 ──
const previewUrl = ref('')
const recognizing = ref(false)
const modelLoading = ref(true)
const modelProgress = ref(0)
const results = ref<{ char: string; confidence: number }[]>([])
const errorMsg = ref('')
const elapsed = ref(0)

let fileData: Blob | null = null
let session: ort.InferenceSession | null = null
let classMap: Record<string, string> = {}

// ── 加载模型和映射 ──
onMounted(async () => {
  try {
    // 用 CDN 加载 onnxruntime-web 的 wasm 文件
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/'
    
    // 同步加载映射表和模型
    const [mapResp, modelResp] = await Promise.all([
      fetch('/class_to_common.json'),
      fetch('/model_fp16.onnx'),
    ])
    
    classMap = await mapResp.json()
    const modelBuffer = await modelResp.arrayBuffer()
    
    modelProgress.value = 100
    session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    })
    
    modelLoading.value = false
    console.log('模型加载成功，', Object.keys(classMap).length, '个类别')
  } catch (err: any) {
    modelLoading.value = false
    errorMsg.value = '模型加载失败：' + (err.message || String(err))
  }
})

// ── 图片处理 ──
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    fileData = input.files[0]
    previewUrl.value = URL.createObjectURL(fileData)
    results.value = []
    errorMsg.value = ''
  }
}

function clearImage() {
  previewUrl.value = ''
  fileData = null
  results.value = []
  errorMsg.value = ''
}

// ── 图像预处理 ──
async function preprocessImage(blob: Blob): Promise<Float32Array> {
  const img = await createImageBitmap(blob, { premultiplyAlpha: 'none' })
  const size = 128
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  // 补白成正方形
  const w = img.width, h = img.height
  const maxSide = Math.max(w, h)
  canvas.width = maxSide
  canvas.height = maxSide
  
  // 白色背景
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, maxSide, maxSide)
  
  // 居中绘制
  const ox = (maxSide - w) / 2
  const oy = (maxSide - h) / 2
  ctx.drawImage(img, ox, oy)
  
  // 缩放到 128x128
  const scaled = document.createElement('canvas')
  scaled.width = size
  scaled.height = size
  const sctx = scaled.getContext('2d')!
  sctx.drawImage(canvas, 0, 0, maxSide, maxSide, 0, 0, size, size)
  
  // 提取像素
  const imageData = sctx.getImageData(0, 0, size, size)
  const pixels = imageData.data
  
  // 转为 float32 并归一化 (CHW 格式)
  const mean = [0.85233593, 0.85246795, 0.8517555]
  const std = [0.31232414, 0.3122127, 0.31273854]
  const tensor = new Float32Array(3 * size * size)
  
  for (let c = 0; c < 3; c++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const pixelIdx = (y * size + x) * 4
        const value = pixels[pixelIdx + c] / 255.0
        tensor[c * size * size + y * size + x] = (value - mean[c]) / std[c]
      }
    }
  }
  
  return tensor
}

// ── 识别 ──
async function startRecognize() {
  if (!fileData || !session) return
  
  recognizing.value = true
  results.value = []
  errorMsg.value = ''
  elapsed.value = 0
  
  const startTime = performance.now()
  
  try {
    // 预处理
    const tensor = await preprocessImage(fileData)
    
    // 推理
    const feeds = {
      input_f32: new ort.Tensor('float32', tensor, [1, 3, 128, 128]),
    }
    const output = await session.run(feeds)
    const logits = output.output.data as Float32Array
    
    // Softmax
    let maxLogit = -Infinity
    for (let i = 0; i < logits.length; i++) {
      if (logits[i] > maxLogit) maxLogit = logits[i]
    }
    let sumExp = 0
    const probs = new Float32Array(logits.length)
    for (let i = 0; i < logits.length; i++) {
      probs[i] = Math.exp(logits[i] - maxLogit)
      sumExp += probs[i]
    }
    for (let i = 0; i < probs.length; i++) {
      probs[i] /= sumExp
    }
    
    // 取 Top 3
    const indexed = Array.from(probs).map((p, i) => ({ idx: i, prob: p }))
    indexed.sort((a, b) => b.prob - a.prob)
    
    for (let i = 0; i < 3; i++) {
      const { idx, prob } = indexed[i]
      const char = classMap[String(idx)] || '?'
      results.value.push({ char, confidence: prob * 100 })
    }
    
    elapsed.value = parseFloat(((performance.now() - startTime) / 1000).toFixed(1))
  } catch (err: any) {
    errorMsg.value = '识别失败：' + (err.message || String(err))
  } finally {
    recognizing.value = false
  }
}
</script>

<style scoped>
.recognize-page { max-width: 860px; margin: 0 auto; padding: 0 20px 60px; }
.upload-zone { margin: 24px 0; }
.upload-placeholder {
  border: 2px dashed var(--gold-pale); border-radius: var(--radius-lg);
  padding: 60px 20px; text-align: center; position: relative; background: var(--paper);
  cursor: pointer; transition: border-color .2s;
}
.upload-placeholder:hover { border-color: var(--gold); }
.upload-icon { font-size: 2.5rem; margin-bottom: 12px; }
.upload-placeholder p { color: var(--ink); margin: 4px 0; }
.hint { font-size: .8rem; color: var(--ink-wash); }
.file-input {
  position: absolute; inset: 0; opacity: 0; cursor: pointer;
}
.preview-area { text-align: center; }
.preview-img { max-width: 100%; max-height: 400px; border-radius: var(--radius-md); border: 2px solid var(--gold-pale); }
.preview-actions { margin-top: 16px; display: flex; gap: 12px; justify-content: center; }
.btn-recognize {
  padding: 12px 32px; background: var(--gold); color: #fff; border: none;
  border-radius: var(--radius-md); font-size: 1rem; letter-spacing: 2px; cursor: pointer;
  transition: background .2s;
}
.btn-recognize:hover:not(:disabled) { background: #b8860b; }
.btn-recognize:disabled { opacity: .6; cursor: not-allowed; }
.btn-clear {
  padding: 12px 24px; background: transparent; border: 1px solid var(--gold-pale);
  color: var(--ink); border-radius: var(--radius-md); cursor: pointer;
}
.loading-bar { margin-top: 16px; text-align: center; }
.loading-text { font-size: .85rem; color: var(--ink-wash); margin-bottom: 8px; }
.progress-track { height: 4px; background: var(--paper-dark); border-radius: 2px; overflow: hidden; max-width: 300px; margin: 0 auto; }
.progress-fill { height: 100%; background: var(--gold); transition: width .3s; }
.error-box {
  margin-top: 16px; padding: 12px 16px; background: #fff0f0;
  border: 1px solid #ecc; border-radius: var(--radius-md); color: #c33; font-size: .85rem;
}
.results-section { margin-top: 24px; }
.results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.results-header h3 { font-size: 1rem; color: var(--ink); letter-spacing: 2px; }
.elapsed { font-size: .8rem; color: var(--ink-wash); }
.result-cards { display: flex; gap: 12px; }
.result-card {
  flex: 1; padding: 20px; background: var(--paper); border: 1px solid var(--paper-dark);
  border-radius: var(--radius-md); text-align: center;
}
.result-card.primary { border-color: var(--gold); background: #fdf8ed; }
.result-char { font-size: 2.5rem; font-family: 'KaiTi', serif; color: var(--ink); margin-bottom: 8px; }
.result-confidence { font-size: 1rem; color: var(--gold); font-weight: bold; }
.result-rank { font-size: .75rem; color: var(--ink-wash); margin-top: 4px; }
.tips-section { margin-top: 40px; }
.tips-card { background: var(--paper); border: 1px solid var(--paper-dark); border-radius: var(--radius-md); padding: 20px 24px; }
.tips-card h4 { font-size: .95rem; color: var(--gold); letter-spacing: 2px; margin-bottom: 12px; }
.tips-card li { font-size: .85rem; color: var(--ink-wash); margin: 6px 0; padding-left: 4px; }
</style>
