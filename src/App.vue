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
import { currentUser, refreshUser, initAuthListener, logoutUser } from './lib/auth'

const year = new Date().getFullYear()
const menuOpen = ref(false)
const showUserMenu = ref(false)
// 全局统一登录状态（模块加载时已从 localStorage 同步恢复，页面秒开不闪烁）
const user = currentUser
const searchQuery = ref('')
const searchFocused = ref(false)
const inkCanvas = ref<HTMLCanvasElement>()
const showTop = ref(false)

function doSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  router.push({ path: '/dictionary', query: { q } })
  searchQuery.value = ''
  menuOpen.value = false
}

async function logout() {
  await logoutUser()
  showUserMenu.value = false
  router.push('/')
}

// ====== 银杏叶拖尾跟随 ======
interface LeafParticle { x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; alpha: number; life: number; maxLife: number; hue: number }
let leafParticles: LeafParticle[] = []
let leafRAF = 0
let mouseX = -200; let mouseY = -200
let prevX = -200; let prevY = -200
let leafSpawnCooldown = 0

function drawLeaf(ctx: CanvasRenderingContext2D, p: LeafParticle) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)
  ctx.globalAlpha = p.alpha
  const s = p.size
  const grad = ctx.createLinearGradient(0, -s, 0, s)
  grad.addColorStop(0, 'rgba(212,175,55,0.85)')
  grad.addColorStop(0.3, 'rgba(201,169,110,0.9)')
  grad.addColorStop(0.7, 'rgba(184,134,11,0.8)')
  grad.addColorStop(1, 'rgba(160,110,20,0.6)')
  ctx.beginPath()
  ctx.moveTo(0, s * 0.5)
  ctx.bezierCurveTo(-s * 0.7, s * 0.08, -s * 0.6, -s * 0.7, 0, -s * 0.85)
  ctx.bezierCurveTo(s * 0.6, -s * 0.7, s * 0.7, s * 0.08, 0, s * 0.5)
  ctx.moveTo(0, -s * 0.25)
  ctx.bezierCurveTo(s * 0.15, s * 0.02, s * 0.15, s * 0.15, 0, -s * 0.4)
  ctx.bezierCurveTo(-s * 0.15, s * 0.15, -s * 0.15, s * 0.02, 0, -s * 0.25)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(0, -s * 0.7)
  ctx.lineTo(0, s * 0.5)
  ctx.strokeStyle = 'rgba(160,120,40,0.25)'
  ctx.lineWidth = 0.4
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, s * 0.5)
  ctx.lineTo(0, s * 0.75)
  ctx.strokeStyle = 'rgba(140,100,30,0.5)'
  ctx.lineWidth = 0.7
  ctx.stroke()
  ctx.restore()
}

function spawnLeaves(x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    leafParticles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 0.6,
      vy: 0.15 + Math.random() * 0.5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      size: 6 + Math.random() * 8,
      alpha: 0.85,
      life: 0,
      maxLife: 50 + Math.random() * 60,
      hue: 40 + Math.random() * 15
    })
  }
  if (leafParticles.length > 100) leafParticles.splice(0, leafParticles.length - 100)
}

function animateLeaves() {
  const canvas = inkCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (mouseX > -100 && mouseY > -100) {
    leafSpawnCooldown--
    const dist = Math.hypot(mouseX - prevX, mouseY - prevY)
    if (leafSpawnCooldown <= 0 && dist > 3) {
      spawnLeaves(mouseX, mouseY, 1)
      leafSpawnCooldown = 2
    }
    if (dist > 20) {
      const steps = Math.floor(dist / 12)
      for (let s = 1; s <= steps; s++) {
        const t = s / (steps + 1)
        spawnLeaves(prevX + (mouseX - prevX) * t, prevY + (mouseY - prevY) * t, 1)
      }
    }
    prevX = mouseX; prevY = mouseY
  }
  for (let i = leafParticles.length - 1; i >= 0; i--) {
    const p = leafParticles[i]
    p.x += p.vx
    p.y += p.vy
    p.vx += (Math.random() - 0.5) * 0.04
    p.vy *= 0.998
    p.rot += p.vr
    p.life++
    const progress = p.life / p.maxLife
    p.alpha = 0.8 * (1 - progress * progress)
    p.size *= 0.9995
    drawLeaf(ctx, p)
    if (p.life >= p.maxLife || p.alpha < 0.02) leafParticles.splice(i, 1)
  }
  leafRAF = requestAnimationFrame(animateLeaves)
}

function onMouseMove(e: MouseEvent) { mouseX = e.clientX; mouseY = e.clientY }
function resizeInkCanvas() {
  const canvas = inkCanvas.value
  if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
}
function initInk() {
  resizeInkCanvas()
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('resize', resizeInkCanvas)
  leafRAF = requestAnimationFrame(animateLeaves)
}
function cleanupInk() {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', resizeInkCanvas)
  cancelAnimationFrame(leafRAF)
  leafParticles = []
}
function onScroll() { showTop.value = window.scrollY > 300 }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

const router = useRouter()
router.afterEach(() => { menuOpen.value = false })

onMounted(() => {
  initAuthListener()
  refreshUser() // 后台静默校验，不阻塞界面
  window.addEventListener('scroll', onScroll, { passive: true })
  initInk()
  document.addEventListener('click', (e) => {
    if (showUserMenu.value && !(e.target as HTMLElement).closest('.nav-user')) showUserMenu.value = false
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  cleanupInk()
})
</script>

<style scoped>
.navbar-ink{position:sticky;top:0;z-index:100;background:linear-gradient(180deg,rgba(26,26,26,0.97) 0%,rgba(26,26,26,0.95) 100%);backdrop-filter:blur(10px);border-bottom:1px solid var(--gold);box-shadow:0 2px 20px rgba(0,0,0,0.15)}
.nav-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;padding:0 20px;height:64px;gap:12px}
.nav-brand{display:flex;align-items:center;gap:12px;text-decoration:none;flex-shrink:0}
.brand-seal{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:2px solid var(--cinnabar);color:var(--cinnabar-light);font-family:'KaiTi','STKaiti',serif;font-size:22px;font-weight:bold;transform:rotate(-5deg);flex-shrink:0;transition:transform 0.3s}
.nav-brand:hover .brand-seal{transform:rotate(0deg)}
.brand-text{display:flex;flex-direction:column;line-height:1.2}
.brand-main{font-family:'KaiTi','STKaiti',serif;font-size:22px;font-weight:bold;color:var(--gold);letter-spacing:3px}
.brand-sub{font-size:10px;color:var(--ink-wash);letter-spacing:1px;text-transform:uppercase}
.nav-search-wrap{position:relative;flex:1;max-width:240px;display:none}
@media(min-width:900px){.nav-search-wrap{display:block}}
.nav-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:0.85rem;color:var(--ink-wash);pointer-events:none}
.nav-search-input{width:100%;padding:7px 14px 7px 34px;background:rgba(255,255,255,0.08);border:1px solid rgba(184,134,11,0.2);border-radius:50px;color:var(--gold-pale);font-size:0.85rem;font-family:inherit;outline:none;transition:all 0.3s;box-sizing:border-box}
.nav-search-input::placeholder{color:rgba(184,134,11,0.3)}
.nav-search-input:focus{background:rgba(255,255,255,0.12);border-color:var(--gold);color:var(--gold)}
.hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px;z-index:101}
.hamburger span{display:block;width:22px;height:2px;background:var(--gold);transition:all .3s ease}
.hamburger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
.hamburger.open span:nth-child(2){opacity:0}
.hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}
.nav-links{display:flex;gap:4px;flex-shrink:0}
.nav-link{display:flex;align-items:center;gap:6px;padding:8px 14px;color:var(--gold-pale);font-size:0.92rem;letter-spacing:1px;border:1px solid transparent;border-radius:var(--radius);transition:all 0.3s ease;text-decoration:none;white-space:nowrap}
.nav-link:hover{color:var(--gold);border-color:rgba(184,134,11,0.3);background:rgba(184,134,11,0.05)}
.nav-link.active{color:var(--gold);border-color:var(--gold);background:rgba(184,134,11,0.08)}
.nav-icon{font-size:1rem}
.nav-login{border:1px solid rgba(184,134,11,.3)}.nav-login:hover{background:rgba(184,134,11,.1)}
.nav-user{position:relative;display:flex;align-items:center;gap:8px;cursor:pointer;padding:6px 12px;border-radius:var(--radius);border:1px solid var(--gold);transition:all .3s;white-space:nowrap}
.nav-user:hover{background:rgba(184,134,11,.08)}
.nav-user-initial{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:rgba(184,134,11,.15);color:var(--gold);font-family:'KaiTi','STKaiti',serif;font-size:14px;font-weight:bold;border-radius:50%}
.nav-user-name{color:var(--gold);font-size:.85rem;letter-spacing:1px}
.user-dropdown{position:absolute;top:100%;right:0;margin-top:8px;background:rgba(26,26,26,.97);border:1px solid var(--gold);border-radius:var(--radius);overflow:hidden;min-width:130px;z-index:110}
.user-dropdown a,.user-dropdown button{display:block;width:100%;padding:10px 16px;background:none;border:none;color:var(--gold-pale);cursor:pointer;font-family:inherit;font-size:.85rem;letter-spacing:1px;text-align:left;text-decoration:none;transition:all .2s}
.user-dropdown a:hover,.user-dropdown button:hover{background:rgba(184,134,11,.1);color:var(--gold)}
.main-view{flex:1}
.page-fade-enter-active,.page-fade-leave-active{transition:opacity 0.25s ease,transform 0.25s ease}
.page-fade-enter-from{opacity:0;transform:translateY(8px)}
.page-fade-leave-to{opacity:0;transform:translateY(-8px)}
.footer-ink{background:var(--ink);border-top:1px solid rgba(184,134,11,0.2);padding:24px 0}
.footer-inner{max-width:1200px;margin:0 auto;text-align:center;padding:0 20px}
.footer-inner p{color:var(--ink-wash);font-size:0.85rem;letter-spacing:2px}
.scroll-top{position:fixed;bottom:32px;right:28px;z-index:99;background:var(--ink);border:1px solid var(--gold);border-radius:var(--radius);width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-md);transition:all .3s ease;opacity:.85}
.scroll-top:hover{opacity:1;transform:translateY(-2px);box-shadow:var(--shadow-lg)}
.scroll-top-seal{font-family:'KaiTi','STKaiti',serif;font-size:20px;color:var(--cinnabar-light);font-weight:bold}
.ink-canvas{position:fixed;inset:0;z-index:50;pointer-events:none}
@media(max-width:900px){.hamburger{display:flex}.nav-links{position:fixed;top:64px;left:0;right:0;background:rgba(26,26,26,.97);flex-direction:column;gap:0;padding:12px 0;transform:translateY(-120%);transition:transform .3s ease;backdrop-filter:blur(10px);border-bottom:1px solid var(--gold);z-index:100}.nav-links.open{transform:translateY(0)}.nav-link{padding:14px 28px;border-radius:0;border:none}.nav-search-wrap{display:block;max-width:none;margin:8px 20px 4px}}
</style>
