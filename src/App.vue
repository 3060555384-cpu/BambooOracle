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
          <router-link to="/community" class="nav-link" active-class="active" @click="menuOpen = false">
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
    <canvas ref="ginkgoCanvas" class="ginkgo-canvas"></canvas>
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
const ginkgoCanvas = ref<HTMLCanvasElement>()
const showTop = ref(false)
let ginkgoParticles: { x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; alpha: number; life: number }[] = []
let ginkgoRAF = 0
let mouseX = -100; let mouseY = -100
let throttleTimer = 0

function drawGinkgoLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, alpha: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.globalAlpha = alpha
  const s = size

  // Ginkgo fan shape
  ctx.beginPath()
  ctx.moveTo(0, s * 0.6)
  ctx.bezierCurveTo(-s * 0.8, s * 0.1, -s * 0.7, -s * 0.8, 0, -s * 0.9)
  ctx.bezierCurveTo(s * 0.7, -s * 0.8, s * 0.8, s * 0.1, 0, s * 0.6)
  // Notch cut
  ctx.moveTo(0, -s * 0.3)
  ctx.lineTo(s * 0.2, 0)
  ctx.lineTo(0, -s * 0.45)
  ctx.lineTo(-s * 0.2, 0)
  ctx.closePath()
  ctx.fillStyle = '#c9a96e'
  ctx.fill()
  ctx.strokeStyle = '#b8860b'
  ctx.lineWidth = 0.6
  ctx.stroke()

  // Stem
  ctx.beginPath()
  ctx.moveTo(0, s * 0.6)
  ctx.lineTo(0, s * 0.9)
  ctx.strokeStyle = '#b8860b'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.restore()
}

function spawnGinkgo(x: number, y: number) {
  const count = 1 + Math.floor(Math.random() * 2)
  for (let i = 0; i < count; i++) {
    ginkgoParticles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 0.5 + Math.random() * 1.5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.04,
      size: 8 + Math.random() * 10,
      alpha: 0.9,
      life: 0
    })
  }
  if (ginkgoParticles.length > 60) ginkgoParticles.splice(0, ginkgoParticles.length - 60)
}

function animateGinkgo() {
  const canvas = ginkgoCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = ginkgoParticles.length - 1; i >= 0; i--) {
    const p = ginkgoParticles[i]
    p.x += p.vx + (Math.random() - 0.5) * 0.3
    p.y += p.vy
    p.rot += p.vr
    p.life++
    p.alpha = Math.max(0, 0.9 - p.life / 80)

    drawGinkgoLeaf(ctx, p.x, p.y, p.size, p.rot, p.alpha)

    if (p.life > 80 || p.alpha <= 0) {
      ginkgoParticles.splice(i, 1)
    }
  }

  ginkgoRAF = requestAnimationFrame(animateGinkgo)
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
  clearTimeout(throttleTimer)
  throttleTimer = window.setTimeout(() => {
    spawnGinkgo(mouseX, mouseY)
  }, 40)
}

function resizeCanvas() {
  const canvas = ginkgoCanvas.value
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}

function initGinkgo() {
  resizeCanvas()
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('resize', resizeCanvas)
  ginkgoRAF = requestAnimationFrame(animateGinkgo)
}

function cleanupGinkgo() {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', resizeCanvas)
  cancelAnimationFrame(ginkgoRAF)
  ginkgoParticles = []
}

function onScroll() { showTop.value = window.scrollY > 300 }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
const router = useRouter()
router.afterEach(() => { menuOpen.value = false })
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  initGinkgo()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  cleanupGinkgo()
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

/* 汉堡菜单 */
.hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px;z-index:101}
.hamburger span{display:block;width:22px;height:2px;background:var(--gold);transition:all .3s ease}
.hamburger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
.hamburger.open span:nth-child(2){opacity:0}
.hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}

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

/* 回到顶部按钮 */
.scroll-top{position:fixed;bottom:32px;right:28px;z-index:99;background:var(--ink);border:1px solid var(--gold);border-radius:var(--radius);width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-md);transition:all .3s ease;opacity:.85}
.scroll-top:hover{opacity:1;transform:translateY(-2px);box-shadow:var(--shadow-lg)}
.scroll-top-seal{font-family:'KaiTi','STKaiti',serif;font-size:20px;color:var(--cinnabar-light);font-weight:bold}

/* 移动端响应式 */
.ginkgo-canvas{position:fixed;inset:0;z-index:50;pointer-events:none}
@media(max-width:768px){
.hamburger{display:flex}
.nav-links{position:fixed;top:64px;left:0;right:0;background:rgba(26,26,26,.97);flex-direction:column;gap:0;padding:12px 0;transform:translateY(-120%);transition:transform .3s ease;backdrop-filter:blur(10px);border-bottom:1px solid var(--gold)}
.nav-links.open{transform:translateY(0)}
.nav-link{padding:14px 28px;border-radius:0;border:none}
}
</style>
