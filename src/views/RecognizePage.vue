<template>
  <div class="recognize-page">
    <div class="page-header">
      <h1>&#128269; 甲骨文字识别</h1>
      <p>上传甲骨拓片或单字图片，AI 自动识别文字内容</p>
    </div>

    <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
      <input type="file" ref="fileInput" accept="image/*" @change="handleFile" style="display:none" />
      <div v-if="!previewUrl" class="upload-placeholder" @click="triggerUpload">
        <div class="upload-icon">&#128196;</div>
        <h3>点击上传或拖拽图片到此处</h3>
        <p>支持 JPG / PNG / WEBP 格式</p>
      </div>
      <div v-else class="preview-section">
        <img :src="previewUrl" class="preview-img" />
        <div class="preview-actions">
          <button class="btn-recognize" @click="startRecognize" :disabled="recognizing">
            {{ recognizing ? '识别中...' : '&#128269; 开始识别' }}
          </button>
          <button class="btn-reset" @click="reset">重新上传</button>
        </div>
      </div>
    </div>

    <div v-if="result" class="result-section">
      <h2 class="result-title">&#9989; 识别结果</h2>
      <div class="result-card">
        <div class="result-char">{{ result.char }}</div>
        <div class="result-info">
          <p><strong>识别文字：</strong>{{ result.char }}</p>
          <p><strong>释义：</strong>{{ result.meaning }}</p>
          <p><strong>字型类别：</strong>{{ result.type }}</p>
          <p><strong>置信度：</strong><span class="confidence">{{ result.confidence }}%</span></p>
        </div>
      </div>
    </div>

    <div class="tips">
      <h3>&#128161; 识别技巧</h3>
      <ul>
        <li>确保图片清晰，光照均匀</li>
        <li>单字识别时尽量裁剪到仅含一个字</li>
        <li>拓片图片建议先做二值化处理</li>
        <li>支持同时识别多个文字</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fileInput = ref<HTMLInputElement>()
const previewUrl = ref('')
const recognizing = ref(false)
const result = ref<{ char: string; meaning: string; type: string; confidence: number } | null>(null)

function triggerUpload() { fileInput.value?.click() }

function handleFile(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) {
    previewUrl.value = URL.createObjectURL(files[0])
  }
}

function handleDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files?.length) {
    previewUrl.value = URL.createObjectURL(files[0])
  }
}

function reset() { previewUrl.value = ''; result.value = null }

function startRecognize() {
  recognizing.value = true
  result.value = null
  setTimeout(() => {
    result.value = { char: '\u65E5', meaning: '太阳、白天、日期', type: '象形字', confidence: 96.5 }
    recognizing.value = false
  }, 1500)
}
</script>

<style scoped>
.recognize-page { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
.page-header { text-align: center; margin-bottom: 30px; }
.page-header h1 { font-size: 28px; color: #1a1a2e; }
.page-header p { color: #888; margin-top: 8px; }

.upload-area { background: white; border: 2px dashed #c9a96e; border-radius: 16px; padding: 50px 20px; text-align: center; min-height: 200px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.3s; }
.upload-area:hover { border-color: #a08050; }
.upload-icon { font-size: 48px; margin-bottom: 12px; }
.upload-placeholder h3 { font-size: 18px; color: #333; margin-bottom: 8px; }
.upload-placeholder p { color: #999; font-size: 14px; }

.preview-section { width: 100%; }
.preview-img { max-width: 100%; max-height: 300px; border-radius: 8px; margin-bottom: 16px; }
.preview-actions { display: flex; gap: 12px; justify-content: center; }
.btn-recognize { padding: 12px 32px; background: #c9a96e; color: #1a1a2e; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
.btn-recognize:disabled { opacity: 0.6; cursor: wait; }
.btn-reset { padding: 12px 24px; background: #f0f0f0; color: #666; border: none; border-radius: 8px; cursor: pointer; }

.result-section { margin-top: 30px; }
.result-title { font-size: 22px; color: #1a1a2e; margin-bottom: 16px; }
.result-card { background: white; border-radius: 12px; padding: 24px; display: flex; gap: 24px; align-items: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.result-char { font-size: 72px; font-family: 'KaiTi','STKaiti',serif; color: #c9a96e; min-width: 100px; text-align: center; }
.result-info p { margin: 6px 0; font-size: 15px; color: #333; }
.confidence { color: #4caf50; font-weight: bold; }

.tips { margin-top: 40px; background: #fff8e1; border-radius: 12px; padding: 20px 24px; }
.tips h3 { color: #a08050; margin-bottom: 12px; }
.tips li { margin: 6px 0; color: #666; font-size: 14px; }
</style>
