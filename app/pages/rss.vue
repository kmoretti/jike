<template>
  <section id="rss" class="timeline-shell">
    <NuxtLink to="/" class="page-back">
      <Icon name="lucide:arrow-left" />
      返回首页
    </NuxtLink>
    <div class="toolbar">
      <span class="toolbar-label">{{ total ? `${total} 篇文章` : 'RSS 文章' }}</span>
      <div class="toolbar-actions">
        <button class="text-button" type="button" :disabled="refreshing" @click="refresh">
          <Icon name="lucide:rss" :class="{ spinning: refreshing }" />
          {{ refreshing ? '抓取中' : '抓取 RSS' }}
        </button>
        <button class="text-button" type="button" :disabled="loading" @click="load(1, false)">
          <Icon name="lucide:refresh-cw" :class="{ spinning: loading && !posts.length }" />
          {{ loading && !posts.length ? '加载中' : '刷新' }}
        </button>
      </div>
    </div>

    <div v-if="loading && !posts.length" class="memo-list" aria-label="正在加载">
      <div v-for="i in 4" :key="i" class="skeleton-card"></div>
    </div>
    <EmptyState v-else-if="error" title="暂时无法读取文章" :message="error" action-label="重新加载" @action="reload" />
    <EmptyState v-else-if="!posts.length" title="这里还没有文章" message="RSS 订阅源新增的文章会在这里展示。" />

    <div v-else>
      <div class="rss-list">
        <article v-for="post in posts" :key="post.id" class="rss-card">
          <h3><a :href="post.link" target="_blank" rel="noopener noreferrer">{{ post.title }}</a></h3>
          <div class="rss-meta">
            <span v-if="post.author">{{ post.author }}</span>
            <span v-if="post.author && post.time">·</span>
            <span v-if="post.time">{{ formatDate(post.time) }}</span>
          </div>
          <p v-if="post.description">{{ strip(post.description) }}</p>
        </article>
      </div>

      <button v-if="posts.length < total" class="load-more" type="button" :disabled="loading" @click="loadMore">
        {{ loading ? '加载中…' : '加载更多' }}
      </button>
    </div>

    <MobileNav @refresh="reload" />
  </section>
</template>

<script setup lang="ts">
import { jikeConfig } from '../../config'
import type { ApiRssPost } from '../types/api'

const RSS_CACHE_KEY = 'rss:first-page'
const RSS_CACHE_TTL = 30 * 60 * 1000 // 30 分钟

interface RssCache {
  items: ApiRssPost[]
  total: number
  page: number
}

useHead({ title: `RSS · ${jikeConfig.site.name}`, meta: [{ name: 'description', content: 'RSS 文章聚合' }] })

const api = useJikeApi()
const posts = useState<ApiRssPost[]>('jike-rss-posts', () => [])
const total = useState('jike-rss-total', () => 0)
const page = useState('jike-rss-page', () => 1)
const pageSize = jikeConfig.pagination.rss
const loading = useState('jike-rss-loading', () => false)
const refreshing = useState('jike-rss-refreshing', () => false)
const error = useState<string | null>('jike-rss-error', () => null)

async function load(targetPage = 1, append = false) {
  if (loading.value) return

  if (targetPage === 1 && !append) {
    const cached = getCachedData<RssCache>(RSS_CACHE_KEY, RSS_CACHE_TTL)
    if (cached) {
      page.value = cached.page
      total.value = cached.total
      posts.value = cached.items
      return
    }
  }

  loading.value = true
  error.value = null
  try {
    const data = await api.getRssPosts(targetPage, pageSize)
    const items = data.items ?? []
    page.value = data.page
    total.value = data.total
    posts.value = append ? [...posts.value, ...items] : items
    if (targetPage === 1 && !append) {
      setCachedData<RssCache>(RSS_CACHE_KEY, { items, total: data.total, page: data.page })
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '文章加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function loadMore() { if (posts.value.length < total.value) load(page.value + 1, true) }
function reload() {
  clearCachedData(RSS_CACHE_KEY)
  load(1, false)
}

async function refresh() {
  if (refreshing.value) return
  refreshing.value = true
  error.value = null
  try {
    await api.refreshRssPosts()
    // Give the backend a moment to persist articles, then reload the list.
    await new Promise(resolve => setTimeout(resolve, 1500))
    clearCachedData(RSS_CACHE_KEY)
    await load(1, false)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'RSS 抓取失败，请稍后重试'
  } finally {
    refreshing.value = false
  }
}

function formatDate(ts: number) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function strip(html: string) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  const text = (tmp.textContent || '').trim()
  return text.length > 200 ? `${text.slice(0, 200)}…` : text
}

onMounted(reload)
</script>

<style scoped>
.toolbar-actions { display: flex; align-items: center; gap: 8px; }
.skeleton-card { min-height: 110px; border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(100deg, var(--surface) 30%, var(--surface-muted) 45%, var(--surface) 60%); background-size: 300% 100%; animation: skeleton 1.6s ease-in-out infinite; }
.spinning { animation: spin .8s linear infinite; }
@keyframes skeleton { to { background-position: -200% 0; } }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
