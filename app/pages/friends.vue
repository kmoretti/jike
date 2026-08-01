<template>
  <section id="friends" class="timeline-shell">
    <NuxtLink to="/" class="page-back">
      <Icon name="lucide:arrow-left" />
      返回首页
    </NuxtLink>
    <h1 class="page-title">友情链接</h1>

    <div v-if="loading && !groups.length" class="memo-list" aria-label="正在加载">
      <div v-for="i in 4" :key="i" class="skeleton-card"></div>
    </div>
    <EmptyState v-else-if="error" title="暂时无法读取友链" :message="error" action-label="重新加载" @action="reload" />
    <EmptyState v-else-if="!groups.length" title="这里还没有友链" message="暂无友链数据。" />

    <div v-else>
      <div v-if="tabs.length > 1" class="group-tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          class="group-tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <div v-for="group in visibleGroups" :key="group.name" class="group-section">
        <div class="group-header">
          <h2 class="group-title">{{ group.name }}</h2>
          <p v-if="group.desc" class="group-desc">{{ group.desc }}</p>
        </div>

        <div class="friends-grid">
          <a
            v-for="(friend, index) in group.links"
            :key="`${group.name}-${index}`"
            class="friend-card"
            :href="friend.url"
            target="_blank"
            rel="noopener noreferrer"
            :style="friend.color ? { '--friend-accent': friend.color } : {}"
          >
            <div class="friend-snapshot" :style="snapshotStyle(friend.siteshot)">
              <div class="friend-shade"></div>
              <span v-if="latencyOf(friend.url) !== undefined" class="friend-status" :class="latencyClass(friend.url)">
                <span class="status-dot"></span>
                {{ latencyText(friend.url) }}
              </span>
              <div class="friend-info">
                <img :src="friend.avatar || defaultAvatar" :alt="friend.name" class="friend-avatar" loading="lazy" />
                <div class="friend-meta">
                  <strong class="friend-name">{{ friend.name }}</strong>
                  <span class="friend-host">{{ host(friend.url) }}</span>
                </div>
              </div>
            </div>
            <div class="friend-body">
              <p v-if="friend.desc" class="friend-desc">{{ friend.desc }}</p>
              <div v-if="friend.tags?.length" class="friend-tags">
                <span
                  v-for="tag in friend.tags"
                  :key="tag"
                  class="friend-tag"
                  :style="tagStyle(friend.color)"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>

      <MySiteInfo />
      <FriendApplyForm />
    </div>

    <MobileNav @refresh="reload" />
  </section>
</template>

<script setup lang="ts">
import { jikeConfig } from '../../config'
import type { ApiFriendGroup, ApiFriendJSON } from '../types/api'

const FRIENDS_CACHE_KEY = 'friends:data'
const FRIENDS_CACHE_TTL = 30 * 60 * 1000 // 30 分钟

interface FriendsCache {
  groups: ApiFriendGroup[]
  latencyMap: Record<string, number>
}

useHead({ title: `友链 · ${jikeConfig.site.name}`, meta: [{ name: 'description', content: '友链列表' }] })

const groups = useState<ApiFriendGroup[]>('jike-friend-groups', () => [])
const activeTab = useState('jike-friend-active-tab', () => '全部')
const loading = useState('jike-friends-loading', () => false)
const error = useState<string | null>('jike-friends-error', () => null)
const latencyMap = useState<Record<string, number>>('jike-friends-latency', () => ({}))
const defaultAvatar = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 36 36%22%3E%3Crect width=%2236%22 height=%2236%22 fill=%22%23e6e6e6%22/%3E%3C/svg%3E'

const tabs = computed(() => {
  const names = groups.value.map(g => g.name).filter(Boolean)
  return names.length > 1 ? ['全部', ...names] : names
})

const visibleGroups = computed(() => {
  if (activeTab.value === '全部' || groups.value.length <= 1) return groups.value
  return groups.value.filter(g => g.name === activeTab.value)
})

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

async function load() {
  if (loading.value) return

  const cached = getCachedData<FriendsCache>(FRIENDS_CACHE_KEY, FRIENDS_CACHE_TTL)
  if (cached) {
    groups.value = cached.groups
    latencyMap.value = cached.latencyMap
    if (groups.value.length && !tabs.value.includes(activeTab.value)) {
      activeTab.value = '全部'
    }
    return
  }

  loading.value = true
  error.value = null
  try {
    const [friendRes, latencyRes] = await Promise.all([
      $fetch<ApiFriendJSON>(`${jikeConfig.api.baseURL}/friend.json`),
      $fetch<LatencyResponse>('https://fc.081531.xyz/link.json'),
    ])

    const map: Record<string, number> = {}
    for (const item of latencyRes.link_data) {
      map[normalizeUrl(item.link)] = item.latency
    }
    latencyMap.value = map

    const list = friendRes.linkGroups || []
    // 过滤掉空分组
    groups.value = list.filter(group => group.links && group.links.length > 0)

    if (groups.value.length && !tabs.value.includes(activeTab.value)) {
      activeTab.value = '全部'
    }

    setCachedData<FriendsCache>(FRIENDS_CACHE_KEY, { groups: groups.value, latencyMap: map })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '友链加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function reload() {
  clearCachedData(FRIENDS_CACHE_KEY)
  load()
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

function latencyOf(url: string) {
  return latencyMap.value[normalizeUrl(url)]
}

function latencyText(url: string) {
  const latency = latencyOf(url)
  return latency === undefined ? '' : `${latency.toFixed(2)}s`
}

function latencyClass(url: string) {
  const latency = latencyOf(url)
  if (latency === undefined) return 'status-unknown'
  if (latency < 0.5) return 'status-survival'
  if (latency < 1.5) return 'status-pending'
  return 'status-timeout'
}

function tagStyle(color?: string) {
  return color ? { '--tag-color': color } : {}
}

onMounted(reload)
</script>

<style scoped>
.skeleton-card { min-height: 110px; border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(100deg, var(--surface) 30%, var(--surface-muted) 45%, var(--surface) 60%); background-size: 300% 100%; animation: skeleton 1.6s ease-in-out infinite; }
@keyframes skeleton { to { background-position: -200% 0; } }

.group-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.group-tab {
  padding: 6px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-tab:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.group-tab.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.group-section {
  margin-bottom: 28px;
}

.group-header {
  margin-bottom: 14px;
}

.group-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.group-desc {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.friend-card {
  border-top: 3px solid var(--friend-accent, var(--line));
}

.friend-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px 12px;
}

.friend-desc {
  margin: 0;
  padding: 0;
  min-height: 0;
}

.friend-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.friend-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tag-color, var(--accent)) 12%, transparent);
  color: var(--tag-color, var(--accent));
  border: 1px solid color-mix(in srgb, var(--tag-color, var(--accent)) 30%, transparent);
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .group-tabs {
    gap: 6px;
  }

  .group-tab {
    padding: 5px 12px;
    font-size: 0.78rem;
  }

  .group-section {
    margin-bottom: 22px;
  }
}
</style>
