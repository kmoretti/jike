<template>
  <div v-if="visible" class="refresh-indicator" role="status" aria-live="polite">
    <span class="refresh-dot" :class="{ spinning: active }"></span>
    <span>{{ label }}</span>
    <button v-if="retryable" type="button" @click="$emit('retry')">重试</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ state: 'idle' | 'loading' | 'checking' | 'refreshing' | 'paused' | 'error'; hasError: boolean }>()
defineEmits<{ retry: [] }>()
const active = computed(() => ['loading', 'checking', 'refreshing'].includes(props.state))
const retryable = computed(() => props.hasError)
const visible = computed(() => active.value || props.hasError || props.state === 'paused')
const label = computed(() => {
  if (props.hasError) return '最新动态获取失败'
  if (props.state === 'paused') return '后台暂停更新'
  if (props.state === 'checking') return '检查最新动态'
  return '正在更新动态'
})
</script>
