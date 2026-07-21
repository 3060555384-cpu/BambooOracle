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
        <div class="nav-search-wrap">
          <span class="nav-search-icon">&#128269;</span>
          <input
            v-model="searchQuery"
            type="text"
            class="nav-search-input"
            placeholder="搜甲骨文字..."
            @keyup.enter="doSearch"
            @focus="searchFocused = true"
            @blur="searchFocused = false"
          />
        </div>
        <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ open: menuOpen }">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-links" :class="{ open: menuOpen }">
          <router-link to="/" class="nav-link" exact-active-class="active" @click="menuOpen = false">
            <span class="nav-icon">&#127968;</span>
            <span>首页</span>
          </router-link>
          <router-link to="/recognize" class="nav-link" active-class="active" @click="menuOpen = false">
            <span class="nav-icon">&#128269;</span>
            <span>识甲</span>
          </router-link>
          <router-link to="/dictionary" class="nav-link" active-class="active" @click="menuOpen = false">
            <span class="nav-icon">&#128218;</span>
            <span>字典</span>
          </router-link>
          <router-link to="/convert" class="nav-link" active-class="active" @click="menuOpen = false">
            <span class="nav-icon">&#128221;</span>
            <span>转换</span>
          </router-link>
          <router-link to="/community" class="nav-link" active-class="active" @click="menuOpen = false">
            <span class="nav-icon">&#128172;</span>
            <span>社群</span>
          </router-link>
          <router-link to="/encyclopedia" class="nav-link" active-class="active" @click="menuOpen = false">
            <span class="nav-icon">&#128214;</span>
            <span>百科</span>
          </router-link>
          <router-link v-if="user" to="/profile" class="nav-link" active-class="active" @click="menuOpen = false">
            <span class="nav-icon">&#9878;</span>
            <span>我的</span>
          </router-link>
          <router-link v-if="!user" to="/login" class="nav-link nav-login">
            <span class="nav-icon">&#128100;</span>
            <span>登录</span>
          </router-link>
          <div v-else class="nav-user" @click="showUserMenu = !showUserMenu">
            <span class="nav-user-initial">甲</span>
            <span class="nav-user-name">{{ user?.nickname || '用户' }}</span>
            <div v-if="showUserMenu" class="user-dropdown">
              <router-link to="/profile" @click="showUserMenu = false">个人中心</router-link>
              <button @click="logout">退出登录</button>
            </div>
          </div>
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
    <canvas ref="inkCanvas" class="ink-canvas"></canvas>
    <footer class="footer-ink">
      <div class="footer-inner">
        <p>竹下问甲 &copy; {{ year }} &mdash; 传承甲骨文明，探索文字之源</p>
      </div>
    </footer>
    <button v-show="showTop" class="scroll-top" @click="scrollToTop" title="回到顶部">
      <span class="scroll-top-seal">甲</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
const year = new Date().getFullYear()
const menuOpen = ref(false)
const showUserMenu = ref(false)
const user = ref<any>(null)
const searchQuery = ref('')
const searchFocused = ref(false)

function checkAuth() {
  const stored = localStorage.getItem('bamboooracle_user')
  if (stored) {
    try { user.value = JSON.parse(stored) } catch { user.value = null }
  }
}

function doSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  router.push({ path: '/dictionary', query: { q } })
  searchQuery.value = ''
  menuOpen.value = false
}

function logout() {
  localStorage.removeItem('bamboooracle_user')
  user.value = null
  showUserMenu.value = false
  router.push('/')
}

// ====== 水墨晕染跟随 ======
const inkCanvas = ref<HTMLCanvasElement>()
const showTop = ref(false)

interface InkParticle { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number; maxLife: number; color: string }
let inkParticles: InkParticle[] = []
let inkRAF = 0
let mouseX = -200; let mouseY = -200
let prevX = -200; let prevY = -200
let spawnTimer = 0

const inkColors = [
  '26,26,26',
  '58,58,58',
  '90,90,90',
  '184,134,11',
  '196,30,30',
]

function drawInkParticle(ctx: CanvasRenderingContext2D, p: InkParticle) {
  ctx.save()
  ctx.globalAlpha = p.alpha

  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
  gradient.addColorStop(0, 'rgba(' + p.color + ',0.6)')
  gradient.addColorStop(0.5, 'rgba(' + p.color + ',0.2)')
  gradient.addColorStop(1, 'rgba(' + p.color + ',0)')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(' + p.color + ',0.8)'
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function spawnInkBurst(x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.3 + Math.random() * 1.5
    const colorIdx = Math.random() < 0.08 ? 3 : (Math.random() < 0.05 ? 4 : Math.floor(Math.random() * 3))
    inkParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.5 + Math.random() * 5,
      alpha: 0.5 + Math.random() * 0.4,
      life: 0,
      maxLife: 40 + Math.random() * 50,
      color: inkColors[colorIdx]
    })
  }
  if (inkParticles.length > 150) inkParticles.splice(0, inkParticles.length - 150)
}

function animateInk() {
  const canvas = inkCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (mouseX > -100 && mouseY > -100) {
    spawnTimer++
    const dist = Math.hypot(mouseX - prevX, mouseY - prevY)
    const spawnRate = Math.min(dist * 0.5, 4)
    if (spawnTimer >= 1) {
      spawnInkBurst(mouseX, mouseY, Math.floor(spawnRate))
      spawnTimer = 0
    }
    
    if (dist > 12) {
      const steps = Math.floor(dist / 8)
      for (let s = 1; s <= steps; s++) {
        const t = s / (steps + 1)
        const ix = prevX + (mouseX - prevX) * t
        const iy = prevY + (mouseY - prevY) * t
        spawnInkBurst(ix, iy, 1)
      }
    }
    prevX = mouseX; prevY = mouseY
  }

  for (let i = inkParticles.length - 1; i >= 0; i--) {
    const p = inkParticles[i]
    p.x += p.vx
    p.y += p.vy
    p.vx *= 0.96
    p.vy *= 0.96
    p.life++
    const progress = p.life / p.maxLife
    p.alpha = 0.6 * (1 - progress) * (1 - progress)
    p.size *= 0.998

    drawInkParticle(ctx, p)

    if (p.life >= p.maxLife || p.alpha < 0.01) {
      inkParticles.splice(i, 1)
    }
  }

  inkRAF = requestAnimationFrame(animateInk)
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function resizeInkCanvas() {
  const canvas = inkCanvas.value
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}

function initInk() {
  resizeInkCanvas()
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('resize', resizeInkCanvas)
  inkRAF = requestAnimationFrame(animateInk)
}

function cleanupInk() {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', resizeInkCanvas)
  cancelAnimationFrame(inkRAF)
  inkParticles = []
}

function onScroll() { showTop.value = window.scrollY > 300 }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

const router = useRouter()
router.afterEach(() => { menuOpen.value = false })

onMounted(() => {
  checkAuth()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('auth-change', checkAuth)
  initInk()
  document.addEventListener('click', (e) => {
    if (showUserMenu.value && !(e.target as HTMLElement).closest('.nav-user')) showUserMenu.value = false
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('auth-change', checkAuth)
  cleanupInk()
})
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
  padding: 0 20px;
  height: 64px;
  gap: 12px;
}

/* 品牌 */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
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

/* 全局搜索 */
.nav-search-wrap {
  position: relative;
  flex: 1;
  max-width: 240px;
  display: none;
}
@media(min-width: 900px) {
  .nav-search-wrap { display: block; }
}
.nav-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: var(--ink-wash);
  pointer-events: none;
}
.nav-search-input {
  width: 100%;
  padding: 7px 14px 7px 34px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(184,134,11,0.2);
  border-radius: 50px;
  color: var(--gold-pale);
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}
.nav-search-input::placeholder { color: rgba(184,134,11,0.3); }
.nav-search-input:focus {
  background: rgba(255,255,255,0.12);
  border-color: var(--gold);
  color: var(--gold);
}

/* 汉堡菜单 */
.hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px;z-index:101}
.hamburger span{display:block;width:22px;height:2px;background:var(--gold);transition:all .3s ease}
.hamburger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
.hamburger.open span:nth-child(2){opacity:0}
.hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}

/* 导航链接 */
.nav-links {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  color: var(--gold-pale);
  font-size: 0.92rem;
  letter-spacing: 1px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
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
.nav-icon { font-size: 1rem; }
.nav-login{border:1px solid rgba(184,134,11,.3)}.nav-login:hover{background:rgba(184,134,11,.1)}
.nav-user{position:relative;display:flex;align-items:center;gap:8px;cursor:pointer;padding:6px 12px;border-radius:var(--radius);border:1px solid var(--gold);transition:all .3s;white-space:nowrap}
.nav-user:hover{background:rgba(184,134,11,.08)}
.nav-user-initial{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:rgba(184,134,11,.15);color:var(--gold);font-family:'KaiTi','STKaiti',serif;font-size:14px;font-weight:bold;border-radius:50%}
.nav-user-name{color:var(--gold);font-size:.85rem;letter-spacing:1px}
.user-dropdown{position:absolute;top:100%;right:0;margin-top:8px;background:rgba(26,26,26,.97);border:1px solid var(--gold);border-radius:var(--radius);overflow:hidden;min-width:130px;z-index:110}
.user-dropdown a,.user-dropdown button{display:block;width:100%;padding:10px 16px;background:none;border:none;color:var(--gold-pale);cursor:pointer;font-family:inherit;font-size:.85rem;letter-spacing:1px;text-align:left;text-decoration:none;transition:all .2s}
.user-dropdown a:hover,.user-dropdown button:hover{background:rgba(184,134,11,.1);color:var(--gold)}

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

/* 回到顶部按钮 */
.scroll-top{position:fixed;bottom:32px;right:28px;z-index:99;background:var(--ink);border:1px solid var(--gold);border-radius:var(--radius);width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-md);transition:all .3s ease;opacity:.85}
.scroll-top:hover{opacity:1;transform:translateY(-2px);box-shadow:var(--shadow-lg)}
.scroll-top-seal{font-family:'KaiTi','STKaiti',serif;font-size:20px;color:var(--cinnabar-light);font-weight:bold}

/* 水墨画布 */
.ink-canvas{position:fixed;inset:0;z-index:50;pointer-events:none}

/* 移动端响应式 */
@media(max-width:900px){
  .hamburger{display:flex}
  .nav-links{position:fixed;top:64px;left:0;right:0;background:rgba(26,26,26,.97);flex-direction:column;gap:0;padding:12px 0;transform:translateY(-120%);transition:transform .3s ease;backdrop-filter:blur(10px);border-bottom:1px solid var(--gold);z-index:100}
  .nav-links.open{transform:translateY(0)}
  .nav-link{padding:14px 28px;border-radius:0;border:none}
  .nav-search-wrap{display:block;max-width:none;margin:8px 20px 4px}
}
</style>