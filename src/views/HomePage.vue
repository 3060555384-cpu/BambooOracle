<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="oracle-char">&#40845;</span>
          甲骨识字
          <span class="oracle-char">&#40845;</span>
        </h1>
        <p class="hero-subtitle">AI 驱动的甲骨文字识别与文化交流平台</p>
        <p class="hero-desc">上传拓片图片，一键识别甲骨文字；与爱好者共同探索古老文字的魅力</p>
        <div class="hero-actions">
          <router-link to="/recognize" class="btn btn-primary">&#128269; 开始识别</router-link>
          <router-link to="/community" class="btn btn-outline">&#128172; 加入社区</router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">&#128220;</div>
        <h3>智能识别</h3>
        <p>上传甲骨拓片图片，AI 模型自动识别文字，支持多种字体变体</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">&#128218;</div>
        <h3>甲骨字典</h3>
        <p>收录常见甲骨文字，提供字形对照、释义和演变过程</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">&#128172;</div>
        <h3>爱好者社区</h3>
        <p>分享有趣的甲骨文发现，交流研究成果，共同学习进步</p>
      </div>
    </section>

    <section class="daily-word">
      <h2 class="section-title">&#127775; 今日甲骨</h2>
      <div class="daily-card">
        <div class="daily-char">&#26085;</div>
        <div class="daily-info">
          <h3>"日" — 太阳，光明</h3>
          <p>象形字，外圆像太阳的轮廓，中间一点表示太阳的光。卜辞中常用"今日""之日"等。</p>
          <p class="daily-tag">#常用字 #自然 #象形</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home { background: #f5f0e8; }
.hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%);
  color: #e8d5b7;
  text-align: center;
  padding: 80px 20px;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='80' font-size='60' opacity='0.05'>&#30002;</text></svg>");
  background-size: 100px;
}
.hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
.hero-title { font-size: 48px; font-family: 'KaiTi','STKaiti',serif; margin-bottom: 16px; }
.oracle-char { color: #c9a96e; font-size: 56px; }
.hero-subtitle { font-size: 20px; color: #c9a96e; margin-bottom: 12px; }
.hero-desc { font-size: 14px; opacity: 0.7; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; justify-content: center; }
.btn {
  display: inline-block;
  padding: 12px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
}
.btn-primary { background: #c9a96e; color: #1a1a2e; }
.btn-primary:hover { background: #d4b87a; }
.btn-outline { border: 2px solid #c9a96e; color: #c9a96e; }
.btn-outline:hover { background: #c9a96e; color: #1a1a2e; }

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1100px;
  margin: -40px auto 40px;
  padding: 0 20px;
}
.feature-card {
  background: white;
  border-radius: 12px;
  padding: 30px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s;
}
.feature-card:hover { transform: translateY(-4px); }
.feature-icon { font-size: 40px; margin-bottom: 12px; }
.feature-card h3 { font-size: 20px; color: #1a1a2e; margin-bottom: 8px; }
.feature-card p { font-size: 14px; color: #666; line-height: 1.6; }

.daily-word { max-width: 1100px; margin: 0 auto 60px; padding: 0 20px; }
.section-title { font-size: 24px; color: #1a1a2e; margin-bottom: 20px; text-align: center; }
.daily-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  gap: 30px;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.daily-char {
  font-size: 80px;
  font-family: 'KaiTi','STKaiti',serif;
  color: #c9a96e;
  min-width: 120px;
  text-align: center;
}
.daily-info h3 { font-size: 20px; color: #1a1a2e; margin-bottom: 8px; }
.daily-info p { font-size: 14px; color: #666; line-height: 1.8; }
.daily-tag { color: #c9a96e !important; margin-top: 8px; }
</style>
