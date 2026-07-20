<template>
  <div id="app-root">
    <nav class="navbar-ink">
      <div class="nav-inner">
        <router-link to="/" class="nav-brand">
          <span class="brand-seal">甲</span>
          <span class="brand-text">
            <span class="brand-main">竹下问甲</span>
            <span class="brand-sub">BambooOracle</span>
          </span>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link" exact-active-class="active">
            <span class="nav-icon">&#127968;</span>
            <span>首页</span>
          </router-link>
          <router-link to="/recognize" class="nav-link" active-class="active">
            <span class="nav-icon">&#128269;</span>
            <span>识甲</span>
          </router-link>
          <router-link to="/dictionary" class="nav-link" active-class="active">
            <span class="nav-icon">&#128218;</span>
            <span>字典</span>
          </router-link>
          <router-link to="/community" class="nav-link" active-class="active">
            <span class="nav-icon">&#128172;</span>
            <span>社群</span>
          </router-link>
        </div>
      </div>
    </nav>
    <main class="main-view">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="footer-ink">
      <div class="footer-inner">
        <p>竹下问甲 &copy; {{ year }} &mdash; 传承甲骨文明，探索文字之源</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
/* === 水墨导航栏 === */
.navbar-ink {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg,
    rgba(26,26,26,0.97) 0%,
    rgba(26,26,26,0.95) 100%
  );
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--gold);
  box-shadow: 0 2px 20px rgba(0,0,0,0.15);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;
  height: 64px;
}

/* 品牌 */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-seal {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--cinnabar);
  color: var(--cinnabar-light);
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 22px;
  font-weight: bold;
  transform: rotate(-5deg);
  flex-shrink: 0;
  transition: transform 0.3s;
}
.nav-brand:hover .brand-seal {
  transform: rotate(0deg);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.brand-main {
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 22px;
  font-weight: bold;
  color: var(--gold);
  letter-spacing: 3px;
}
.brand-sub {
  font-size: 10px;
  color: var(--ink-wash);
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* 导航链接 */
.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  color: var(--gold-pale);
  font-size: 0.95rem;
  letter-spacing: 1px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  transition: all 0.3s ease;
  text-decoration: none;
}
.nav-link:hover {
  color: var(--gold);
  border-color: rgba(184,134,11,0.3);
  background: rgba(184,134,11,0.05);
}
.nav-link.active {
  color: var(--gold);
  border-color: var(--gold);
  background: rgba(184,134,11,0.08);
}
.nav-icon {
  font-size: 1rem;
}

/* 主内容区 */
.main-view {
  flex: 1;
}

/* 页面切换动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 页脚 */
.footer-ink {
  background: var(--ink);
  border-top: 1px solid rgba(184,134,11,0.2);
  padding: 24px 0;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
}
.footer-inner p {
  color: var(--ink-wash);
  font-size: 0.85rem;
  letter-spacing: 2px;
}
</style>
