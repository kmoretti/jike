<template>
  <section class="timeline-shell detail-page">
    <NuxtLink class="back-link" to="/">← 返回时间线</NuxtLink>
    <div v-if="moment" class="memo-list">
      <MemoCard :moment="moment" @reaction="reaction => toggle(moment!, reaction)" />
      <GitalkComments :id="moment.id" :title="`说说 #${moment.id}`" />
    </div>
    <EmptyState v-else-if="error" title="找不到这条动态" :message="error" action-label="返回首页" @action="navigateTo('/')" />
    <div v-else class="memo-card skeleton-card"></div>
  </section>
</template>

<script setup lang="ts">
import type { Moment } from '../../types/moment'
const route = useRoute()
const api = useJikeApi()
const { toggle } = useMomentReactions()
const moment = ref<Moment | null>(null)
const error = ref<string | null>(null)
const id = Number(route.params.id)

onMounted(async () => {
  try {
    const result = await api.getMoments(1, 100)
    moment.value = result.items.find(item => item.id === id) || null
    if (!moment.value) error.value = '这条动态不存在或已被隐藏'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '动态加载失败，请稍后重试'
  }
})
</script>

<style scoped>
.detail-page { min-height: 70vh; }
.back-link { display: inline-block; margin-bottom: 24px; color: var(--text-muted); text-decoration: none; }
.back-link:hover { color: var(--accent); }
.skeleton-card { min-height: 240px; background: var(--surface-muted); }
</style>
