<template>
  <div class="notfound-page">
    <div class="notfound-seal">甲</div>
    <h1>404</h1>
    <p>此页无存，如甲骨埋于尘土</p>
    <hr class="ink-divider" />
    <router-link to="/" class="btn-ink">返回首页</router-link>
  </div>
</template>

<style scoped>
.notfound-page{text-align:center;padding:120px 20px;display:flex;flex-direction:column;align-items:center;gap:16px}
.notfound-seal{width:80px;height:80px;display:flex;align-items:center;justify-content:center;border:3px solid var(--cinnabar-light);color:var(--cinnabar-light);font-family:'KaiTi','STKaiti',serif;font-size:36px;transform:rotate(-8deg);margin-bottom:8px}
.notfound-page h1{font-family:'KaiTi','STKaiti',serif;font-size:5rem;color:var(--gold-pale);line-height:1}
.notfound-page p{color:var(--ink-wash);font-size:1.05rem;letter-spacing:2px}
</style>
