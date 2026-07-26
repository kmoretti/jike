<template>
  <section id="friends" class="timeline-shell">
    <NuxtLink to="/" class="page-back">
      <Icon name="lucide:arrow-left" />
      返回首页
    </NuxtLink>
    <h1 class="page-title">友情链接</h1>

    <div v-if="loading && !friends.length" class="memo-list" aria-label="正在加载">
      <div v-for="i in 4" :key="i" class="skeleton-card"></div>
    </div>
    <EmptyState v-else-if="error" title="暂时无法读取友链" :message="error" action-label="重新加载" @action="reload" />
    <EmptyState v-else-if="!friends.length" title="这里还没有友链" message="暂无与延迟检测数据匹配的友链。" />

    <div v-else>
      <div class="friends-grid">
        <a
          v-for="friend in friends"
          :key="friend.id"
          class="friend-card"
          :href="friend.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="friend-snapshot" :style="snapshotStyle(friend.snapshot)">
            <div class="friend-shade"></div>
            <span class="friend-status" :class="latencyClass(friend.link)">
              <span class="status-dot"></span>
              {{ latencyText(friend.link) }}
            </span>
            <div class="friend-info">
              <img :src="friend.avatar || defaultAvatar" :alt="friend.name" class="friend-avatar" loading="lazy" />
              <div class="friend-meta">
                <strong class="friend-name">{{ friend.name }}</strong>
                <span class="friend-host">{{ host(friend.link) }}</span>
              </div>
            </div>
          </div>
          <p v-if="friend.description" class="friend-desc">{{ friend.description }}</p>
        </a>
      </div>

      <button v-if="hasMore" class="load-more" type="button" :disabled="loading" @click="loadMore">
        {{ loading ? '加载中…' : '加载更多' }}
      </button>

      <MySiteInfo />
      <FriendApplyForm />
    </div>

    <MobileNav @refresh="reload" />
  </section>
</template>

<script setup lang="ts">
import { jikeConfig } from '../../config'
import type { ApiFriendLink } from '../types/api'

useHead({ title: `友链 · ${jikeConfig.site.name}`, meta: [{ name: 'description', content: '友链列表' }] })

const api = useJikeApi()
const friends = useState<ApiFriendLink[]>('jike-friends', () => [])
const total = useState('jike-friends-total', () => 0)
const page = useState('jike-friends-page', () => 1)
const pageSize = jikeConfig.pagination.friends
const loading = useState('jike-friends-loading', () => false)
const error = useState<string | null>('jike-friends-error', () => null)
const latencyMap = useState<Record<string, number>>('jike-friends-latency', () => ({}))
const defaultAvatar = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 36 36%22%3E%3Crect width=%2236%22 height=%2236%22 fill=%22%23e6e6e6%22/%3E%3C/svg%3E'

const hasMore = computed(() => page.value * pageSize < total.value)

interface LatencyItem {
  link: string
  latency: number
  reachable: boolean
}

interface LatencyResponse {
  link_data: LatencyItem[]
}

function normalizeUrl(url: string) {
  return url.replace(/\/$/, '')
}

async function load(targetPage = 1, append = false) {
  if (loading.value) return
  loading.value = true
  error.value = null
  try {
    let map = latencyMap.value
    if (Object.keys(map).length === 0) {
      const latencyRes = await $fetch<LatencyResponse>('https://fc.081531.xyz/link.json')
      map = {}
      for (const item of latencyRes.link_data) {
        map[normalizeUrl(item.link)] = item.latency
      }
      latencyMap.value = map
    }

    const data = await api.getFriendLinks(targetPage, pageSize)
    page.value = data.page
    total.value = data.total
    const matched = data.items.filter(friend => normalizeUrl(friend.link) in map)
    friends.value = append ? [...friends.value, ...matched] : matched
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '友链加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (hasMore.value) load(page.value + 1, true)
}

function reload() {
  load(1, false)
}

function snapshotStyle(url?: string) {
  return url ? { backgroundImage: `url(${url})` } : {}
}

function host(url: string) {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

function latencyOf(link: string) {
  return latencyMap.value[normalizeUrl(link)]
}

function latencyText(link: string) {
  const latency = latencyOf(link)
  return latency === undefined ? '未知' : `${latency.toFixed(2)}s`
}

function latencyClass(link: string) {
  const latency = latencyOf(link)
  if (latency === undefined) return 'status-unknown'
  if (latency < 0.5) return 'status-survival'
  if (latency < 1.5) return 'status-pending'
  return 'status-timeout'
}

onMounted(reload)
</script>

<style scoped>
.skeleton-card { min-height: 110px; border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(100deg, var(--surface) 30%, var(--surface-muted) 45%, var(--surface) 60%); background-size: 300% 100%; animation: skeleton 1.6s ease-in-out infinite; }
@keyframes skeleton { to { background-position: -200% 0; } }
</style>
