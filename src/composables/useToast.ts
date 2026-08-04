import { reactive } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'info' | 'success' | 'error'
}

const state = reactive<{ toasts: Toast[]; nextId: number }>({
  toasts: [],
  nextId: 0,
})

export function useToast() {
  function toast(message: string, type: Toast['type'] = 'info') {
    const id = state.nextId++
    state.toasts.push({ id, message, type })
    setTimeout(() => {
      const idx = state.toasts.findIndex(t => t.id === id)
      if (idx >= 0) state.toasts.splice(idx, 1)
    }, 3000)
  }

  return { toasts: state.toasts, toast }
}
