<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
          <span class="toast-icon">{{ icons[t.type] }}</span>
          <span class="toast-msg">{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts } = useToast()

const icons: Record<string, string> = {
  info: 'i',
  success: '\u2713',
  error: '\u2717',
}
</script>

<style scoped>
.toast-container {
  position: fixed; top: 20px; right: 20px; z-index: 9999;
  display: flex; flex-direction: column; gap: 10px; pointer-events: none;
}
.toast {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px; border-radius: 8px;
  font-size: .88rem; color: #fff;
  backdrop-filter: blur(8px); box-shadow: 0 4px 20px rgba(0,0,0,.15);
  pointer-events: auto; min-width: 200px; max-width: 380px;
}
.toast.info { background: rgba(30,30,30,.92); border-left: 3px solid var(--gold); }
.toast.success { background: rgba(34,84,34,.92); border-left: 3px solid var(--jade); }
.toast.error { background: rgba(120,20,20,.92); border-left: 3px solid var(--cinnabar); }
.toast-icon { font-weight: bold; font-size: 1.1rem; flex-shrink: 0; width: 20px; text-align: center; }
.toast.success .toast-icon { color: #8fdf8f; }
.toast.error .toast-icon { color: #f88; }
.toast.info .toast-icon { color: var(--gold); }
.toast-msg { line-height: 1.4; }

.toast-enter-active { animation: toastIn .3s ease; }
.toast-leave-active { animation: toastOut .3s ease; }
@keyframes toastIn { from { opacity:0; transform: translateX(40px) } to { opacity:1; transform: translateX(0) } }
@keyframes toastOut { from { opacity:1; transform: translateX(0) } to { opacity:0; transform: translateX(40px) } }
</style>
