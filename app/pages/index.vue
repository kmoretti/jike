<template>
  <section id="timeline" class="timeline-shell">
    <div class="toolbar">
      <span class="toolbar-label">{{ total ? `${total} 条动态` : '动态' }}</span>
      <button class="text-button" type="button" :disabled="loading || refreshing" @click="refresh">
        <Icon name="lucide:refresh-cw" :class="{ spinning: refreshing }" />
        {{ refreshing ? '更新中' : '刷新' }}
      </button>
    </div>

    <RefreshIndicator :state="refreshState" :has-error="Boolean(error)" @retry="refresh" />

    <div v-if="loading && !moments.length" class="memo-list" aria-label="正在加载">
      <div v-for="item in 3" :key="item" class="memo-card skeleton-card"></div>
    </div>
    <EmptyState v-else-if="!moments.length && error" title="暂时无法读取动态" :message="error" action-label="重新加载" @action="refresh" />
    <EmptyState v-else-if="!moments.length" title="这里还没有动态" message="新的记录会出现在这条时间线上。" />

    <div v-else class="memo-list">
      <MemoCard v-for="moment in moments" :key="moment.id" :moment="moment" @reaction="reaction => toggle(moment, reaction)" />
    </div>

    <button v-if="moments.length < total" class="load-more" type="button" :disabled="loading" @click="loadMore">
      {{ loading ? '加载中…' : '加载更多' }}
    </button>

    <MobileNav @refresh="refresh" @theme="toggleTheme" />
  </section>
</template>

<script setup lang="ts">
import { jikeConfig } from '../../config'
import { useJikeMoments } from '../composables/useJikeMoments'
import { useMomentReactions } from '../composables/useMomentReactions'
import { useShortPolling } from '../composables/useShortPolling'

useHead({ title: jikeConfig.site.name, meta: [{ name: 'description', content: jikeConfig.site.description }] })

const { moments, total, loading, refreshing, error, load, refresh, loadMore, probe } = useJikeMoments()
const { toggle } = useMomentReactions()
const polling = useShortPolling(probe)
const colorMode = useColorMode()
const refreshState = computed(() => {
  if (error.value) return 'error'
  if (refreshing.value) return 'refreshing'
  if (loading.value) return 'loading'
  return polling.state.value
})

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

onMounted(() => load())
</script>

<style scoped>
.skeleton-card { min-height: 190px; background: linear-gradient(100deg, var(--surface) 30%, var(--surface-muted) 45%, var(--surface) 60%); background-size: 300% 100%; animation: skeleton 1.6s ease-in-out infinite; }
.spinning { animation: spin .8s linear infinite; }
@keyframes skeleton { to { background-position: -200% 0; } }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
