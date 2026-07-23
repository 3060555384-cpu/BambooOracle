<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-seal">甲</div>
      <h1 class="auth-title">{{ isRegister ? '注册' : '登录' }}</h1>
      <p class="auth-sub">竹下问甲，探寻文字之源</p>
      <hr class="ink-divider" />
      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="isRegister" class="form-group">
          <label>昵称 <span class="form-hint">（至少2个字）</span></label>
          <input v-model="form.nickname" type="text" placeholder="给自己取个雅号" />
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="form.email" type="email" placeholder="name@example.com" />
        </div>
        <div class="form-group">
          <label>密码 <span class="form-hint">（至少6位）</span></label>
          <input v-model="form.password" type="password" placeholder="不少于 6 位" />
        </div>
        <p v-if="errMsg" class="auth-error">{{ errMsg }}</p>
        <p v-if="succMsg" class="auth-success">{{ succMsg }}</p>
        <button type="submit" class="btn-ink auth-btn" :disabled="loading">{{ loading ? '处理中...' : (isRegister ? '创建账号' : '登录') }}</button>
      </form>
      <p class="auth-toggle">
        <span v-if="!isRegister">尚无账号？<a href="#" @click.prevent="switchMode">立即注册</a></span>
        <span v-else>已有账号？<a href="#" @click.prevent="switchMode">去登录</a></span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
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

function validateForm(): string | null {
  if (isRegister.value && form.nickname.trim().length < 2) return '请输入昵称（至少2个字符）'
  if (!/^[^\s@]+@[^\s@]+$/.test(form.email)) return '请输入有效的邮箱地址'
  if (form.password.length < 6) return '密码至少需要6位'
  return null
}

function switchMode() {
  isRegister.value = !isRegister.value
  errMsg.value = ''
  succMsg.value = ''
  form.nickname = ''
  form.email = ''
  form.password = ''
}

async function handleSubmit() {
  if (loading.value) return
  errMsg.value = ''
  succMsg.value = ''

  const validationError = validateForm()
  if (validationError) {
    errMsg.value = validationError
    return
  }

  loading.value = true

  try {
    if (isRegister.value) {
      // 注册：signUp 返回 3 种情况需全部处理
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { nickname: form.nickname.trim() || form.email.split('@')[0] }
        }
      })
      if (error) throw error

      const nick = form.nickname.trim() || form.email.split('@')[0]

      if (data.session && data.user) {
        // 情况1：邮件自动确认（mailer_autoconfirm=true），直接登录
        setCurrentUser({ id: data.user.id, email: data.user.email!, nickname: nick })
        supabase.from('profiles').upsert({ id: data.user.id, nickname: nick }).then(() => {}, () => {})
        succMsg.value = '注册成功！'
        setTimeout(() => {
          switchMode()
          router.push((route.query.redirect as string) || '/')
        }, 800)
      } else if (data.user) {
        // 情况2：有用户但无 session，需邮箱验证
        supabase.from('profiles').upsert({ id: data.user.id, nickname: nick }).then(() => {}, () => {})
        succMsg.value = '注册成功！请查收邮箱验证邮件后登录。'
        setTimeout(() => switchMode(), 2500)
      } else {
        // 情况3：signUp 返回空（极端情况），仍然可能是邮箱验证模式
        succMsg.value = '已发送验证邮件，请查收邮箱后登录。'
        setTimeout(() => switchMode(), 2500)
      }
    } else {
      // 登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })
      if (error) throw error
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          email: data.user.email!,
          nickname: data.user.user_metadata?.nickname || '甲骨学者'
        })
        router.push((route.query.redirect as string) || '/')
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
.auth-btn:disabled{opacity:.6;cursor:not-allowed}
.form-hint{font-size:.75rem;color:var(--ink-wash);font-weight:400}
.auth-toggle{font-size:.85rem;color:var(--ink-wash);margin-top:20px}
.auth-toggle a{color:var(--gold);text-decoration:none;border-bottom:1px solid transparent;transition:border-color .3s}
.auth-toggle a:hover{border-bottom-color:var(--gold)}
</style>
