import { jikeConfig } from '../../config'

export function useShortPolling(probe: () => Promise<boolean>) {
  const state = ref<'idle' | 'checking' | 'paused' | 'error'>('idle')
  const changed = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let running = false

  const clear = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  const schedule = () => {
    clear()
    if (!import.meta.client || !jikeConfig.refresh.enabled) return
    timer = setTimeout(run, jikeConfig.refresh.interval)
  }

  const run = async () => {
    if (running || document.visibilityState === 'hidden') {
      state.value = 'paused'
      schedule()
      return
    }
    running = true
    state.value = 'checking'
    try {
      changed.value = await probe()
      state.value = 'idle'
    } catch {
      state.value = 'error'
    } finally {
      running = false
      schedule()
    }
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      void run()
    } else {
      state.value = 'paused'
      clear()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)
    schedule()
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    clear()
  })

  return { state, changed, run, clear }
}
