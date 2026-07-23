<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-seal">甲</div>
      <h1 class="auth-title">{{ isRegister ? '注册' : '登录' }}</h1>
      <p class="auth-sub">竹下问甲，探寻文字之源</p>
      <hr class="ink-divider" />
      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="isRegister" class="form-group">
          <label>昵称</label>
          <input v-model="form.nickname" type="text" placeholder="给自己取个雅号" />
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="form.email" type="email" placeholder="name@example.com" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="不少于 6 位" />
        </div>
        <p v-if="errMsg" class="auth-error">{{ errMsg }}</p>
        <p v-if="succMsg" class="auth-success">{{ succMsg }}</p>
        <button type="submit" class="btn-ink auth-btn" :disabled="loading || !valid">{{ loading ? '处理中...' : (isRegister ? '创建账号' : '登录') }}</button>
      </form>
      <p class="auth-toggle">
        <span v-if="!isRegister">尚无账号？<a href="#" @click.prevent="switchMode">立即注册</a></span>
        <span v-else>已有账号？<a href="#" @click.prevent="switchMode">去登录</a></span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import { setCurrentUser } from '../lib/auth'

const router = useRouter()
const route = useRoute()
const isRegister = ref(false)
const errMsg = ref('')
const succMsg = ref('')
const loading = ref(false)
const form = reactive({ nickname: '', email: '', password: '' })
const valid = computed(() => {
  const e = /^[^\s@]+@[^\s@]+$/.test(form.email)
  const p = form.password.length >= 6
  const n = isRegister.value ? form.nickname.trim().length >= 2 : true
  return e && p && n
})

function switchMode() {
  isRegister.value = !isRegister.value
  errMsg.value = ''
  succMsg.value = ''
  form.nickname = ''
  form.email = ''
  form.password = ''
}

async function handleSubmit() {
  if (!valid.value || loading.value) return
  errMsg.value = ''
  succMsg.value = ''
  loading.value = true

  try {
    if (isRegister.value) {
      // 注册
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { nickname: form.nickname || form.email.split('@')[0] }
        }
      })
      if (error) throw error
      if (data.user) {
        // 注册成功立即写入全局状态，不等待 profiles 更新
        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          nickname: form.nickname || data.user.user_metadata?.nickname || '甲骨学者'
        })
        // 异步更新 profiles，失败不阻塞用户
        supabase.from('profiles').update({ nickname: form.nickname }).eq('id', data.user.id)
          .then(() => {}, () => {})
        succMsg.value = '注册成功！'
        setTimeout(() => {
          switchMode()
          const redirect = (route.query.redirect as string) || '/'
          router.push(redirect)
        }, 800)
      }
    } else {
      // 登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })
      if (error) throw error
      if (data.user) {
        // 登录成功：立即写入全局登录状态（同步生效），不再等待异步校验
        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          nickname: data.user.user_metadata?.nickname || '甲骨学者'
        })
        const redirect = (route.query.redirect as string) || '/'
        router.push(redirect)
      }
    }
  } catch (error: any) {
    errMsg.value = error.message || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page{min-height:70vh;display:flex;align-items:center;justify-content:center;padding:40px 20px}
.auth-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:48px 36px 36px;max-width:420px;width:100%;text-align:center;box-shadow:var(--shadow-lg)}
.auth-seal{width:56px;height:56px;display:inline-flex;align-items:center;justify-content:center;border:2px solid var(--cinnabar-light);color:var(--cinnabar-light);font-family:'KaiTi','STKaiti',serif;font-size:26px;font-weight:bold;transform:rotate(-6deg);margin-bottom:16px}
.auth-title{font-family:'KaiTi','STKaiti',serif;font-size:1.6rem;color:var(--ink);letter-spacing:4px;margin-bottom:4px}
.auth-sub{font-size:.85rem;color:var(--ink-wash);letter-spacing:2px}
.auth-form{text-align:left;margin-top:20px}
.form-group{margin-bottom:16px}
.form-group label{display:block;font-size:.85rem;color:var(--ink);margin-bottom:6px;letter-spacing:1px}
.form-group input{width:100%;padding:12px 14px;border:1px solid var(--paper-dark);border-radius:var(--radius-md);font-size:.95rem;outline:none;font-family:inherit;background:var(--paper-light);transition:border-color .3s;box-sizing:border-box}
.form-group input:focus{border-color:var(--gold);background:#fff}
.auth-error{color:var(--cinnabar);font-size:.82rem;margin-top:4px;text-align:center}
.auth-success{color:var(--jade);font-size:.82rem;margin-top:4px;text-align:center}
.auth-btn{width:100%;margin-top:8px}
.auth-toggle{font-size:.85rem;color:var(--ink-wash);margin-top:20px}
.auth-toggle a{color:var(--gold);text-decoration:none;border-bottom:1px solid transparent;transition:border-color .3s}
.auth-toggle a:hover{border-bottom-color:var(--gold)}
</style>
