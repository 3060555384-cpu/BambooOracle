<template>
  <div class="recognize-page">
    <div class="page-header">
      <h1>识甲</h1>
      <p>上传甲骨拓片或单字图片，AI 自动辨识文字</p>
      <hr class="ink-divider" />
    </div>
    <div class="iframe-container">
      <iframe 
        src="https://modelscope.cn/studios/Austin888/bamboo-oracle-ocr" 
        frameborder="0"
        width="100%"
        height="700px"
        title="甲骨文识别"
      ></iframe>
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
</script>

<style scoped>
.recognize-page{max-width:860px;margin:0 auto;padding:0 20px 60px}
.iframe-container{border:2px solid var(--gold-pale);border-radius:var(--radius-lg);overflow:hidden;background:#fff;min-height:700px}
.tips-section{margin-top:40px}
.tips-card{background:var(--paper);border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:20px 24px}
.tips-card h4{font-size:.95rem;color:var(--gold);letter-spacing:2px;margin-bottom:12px}
.tips-card li{font-size:.85rem;color:var(--ink-wash);margin:6px 0;padding-left:4px}
</style>
