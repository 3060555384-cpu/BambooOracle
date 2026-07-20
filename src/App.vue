<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          <span class="brand-icon">&#128220;</span> 甲骨识字
        </router-link>
        <div class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/recognize">识别扫描</router-link>
          <router-link to="/dictionary">甲骨字典</router-link>
          <router-link to="/community">爱好者社区</router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e8d5b7;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 2px solid #c9a96e;
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}
.nav-brand {
  font-size: 24px;
  font-weight: bold;
  color: #c9a96e;
  text-decoration: none;
  font-family: 'KaiTi', 'STKaiti', serif;
}
.brand-icon { font-size: 28px; }
.nav-links { display: flex; gap: 30px; }
.nav-links a {
  color: #e8d5b7;
  text-decoration: none;
  font-size: 16px;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.nav-links a:hover,
.nav-links a.router-link-active {
  color: #c9a96e;
  border-bottom-color: #c9a96e;
}
.main-content { min-height: calc(100vh - 60px); }
</style>
