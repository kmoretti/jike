<template>
  <section class="gitalk-section" :class="{ inline, 'is-dark': isDark }">
    <div ref="gitalkEl" class="gitalk-container" />
  </section>
</template>

<script setup lang="ts">
import Gitalk from 'gitalk'
import { jikeConfig } from '../../config'

const props = defineProps<{
  id: string | number
  title?: string
  inline?: boolean
}>()

const gitalkEl = ref<HTMLElement | null>(null)
const colorMode = useColorMode()
const runtimeConfig = useRuntimeConfig()

const isDark = ref(false)

function detectDark() {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

watch(() => colorMode.value, () => {
  isDark.value = detectDark()
}, { immediate: true })

const themeClass = computed(() => isDark.value ? 'gitalk-theme-dark' : 'gitalk-theme-light')

function getGitalkConfig() {
  const envAdmin = runtimeConfig.public.gitalkAdmin as string | undefined

  return {
    clientID: (runtimeConfig.public.gitalkClientId as string | undefined) || '',
    clientSecret: (runtimeConfig.public.gitalkClientSecret as string | undefined) || '',
    repo: (runtimeConfig.public.gitalkRepo as string | undefined) || jikeConfig.gitalk.repo,
    owner: (runtimeConfig.public.gitalkOwner as string | undefined) || jikeConfig.gitalk.owner,
    admin: envAdmin
      ? envAdmin.split(',').map(s => s.trim()).filter(Boolean)
      : jikeConfig.gitalk.admin,
    labels: jikeConfig.gitalk.labels,
    id: String(props.id).slice(0, 49),
    title: (props.title as string) || `说说 #${props.id}`,
    body: `https://${typeof window !== 'undefined' ? window.location.host : ''}/memo/${props.id}`,
    language: jikeConfig.gitalk.language,
    perPage: jikeConfig.gitalk.perPage,
    pagerDirection: jikeConfig.gitalk.pagerDirection,
    createIssueManually: jikeConfig.gitalk.createIssueManually,
    distractionFreeMode: jikeConfig.gitalk.distractionFreeMode,
    proxy: (runtimeConfig.public.gitalkProxy as string | undefined)
      || (runtimeConfig.public.gitalkUseProxy && typeof window !== 'undefined'
        ? `${window.location.origin}/api/github-oauth`
        : jikeConfig.gitalk.proxy),
  }
}

function patchGitHubApiProxy() {
  if (typeof window === 'undefined') return
  if ((window as any).__gitalkApiPatched) return
  ;(window as any).__gitalkApiPatched = true

  const useProxy = (runtimeConfig.public.gitalkUseProxy as boolean | undefined)
  console.log('[Gitalk] useProxy:', useProxy)
  if (!useProxy) return

  const GITHUB_API = 'https://api.github.com/'
  const PROXY_API = `${window.location.origin}/api/github/`

  // Patch XMLHttpRequest（gitalk 内部部分请求走 XHR）
  const originalOpen = XMLHttpRequest.prototype.open as (method: string, url: string, ...rest: any[]) => void
  XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: any[]) {
    const urlStr = typeof url === 'string' ? url : url.toString()
    if (urlStr.startsWith(GITHUB_API)) {
      const proxied = urlStr.replace(GITHUB_API, PROXY_API)
      console.log('[Gitalk] proxy XHR:', urlStr, '->', proxied)
      return originalOpen.call(this, method, proxied, ...rest)
    }
    return originalOpen.call(this, method, urlStr, ...rest)
  }

  // Patch fetch（gitalk 新版可能走 fetch）
  const originalFetch = window.fetch
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (typeof input === 'string' && input.startsWith(GITHUB_API)) {
      const proxied = input.replace(GITHUB_API, PROXY_API)
      console.log('[Gitalk] proxy fetch:', input, '->', proxied)
      return originalFetch(proxied, init)
    }
    if (input instanceof URL && input.toString().startsWith(GITHUB_API)) {
      const proxied = input.toString().replace(GITHUB_API, PROXY_API)
      console.log('[Gitalk] proxy fetch:', input.toString(), '->', proxied)
      return originalFetch(proxied, init)
    }
    if (input instanceof Request && input.url.startsWith(GITHUB_API)) {
      const proxied = input.url.replace(GITHUB_API, PROXY_API)
      const newRequest = new Request(proxied, input)
      console.log('[Gitalk] proxy fetch:', input.url, '->', proxied)
      return originalFetch(newRequest)
    }
    return originalFetch(input, init)
  }
}

let gitalk: InstanceType<typeof Gitalk> | null = null

onMounted(async () => {
  if (!gitalkEl.value) return
  const config = getGitalkConfig()
  if (!config.clientID || !config.clientSecret || !config.repo || !config.owner) {
    console.warn('[Gitalk] 配置不完整，跳过评论渲染', {
      hasClientID: !!config.clientID,
      hasClientSecret: !!config.clientSecret,
      repo: config.repo,
      owner: config.owner,
    })
    return
  }

  try {
    console.log('[Gitalk] runtimeConfig.public:', runtimeConfig.public)
    patchGitHubApiProxy()
    const { default: GitalkCtor } = await import('gitalk')
    gitalk = new GitalkCtor(config)
    gitalk.render(gitalkEl.value)

    watch(themeClass, (val, oldVal) => {
      if (gitalkEl.value) {
        if (oldVal) gitalkEl.value.classList.remove(oldVal)
        gitalkEl.value.classList.add(val)
      }
    }, { immediate: true })
  } catch (err) {
    console.error('[Gitalk] 初始化失败:', err)
  }
})
</script>

<style scoped>
.gitalk-section {
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
}

.gitalk-section.inline {
  margin-top: 12px;
}

.gitalk-container {
  width: 100%;
  min-height: 200px;
}

.gitalk-container :deep(.gt-container) {
  font-family: inherit;
  color: var(--text);
}

/* Header: comment count + current user */
.gitalk-container :deep(.gt-container .gt-header) {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.gitalk-container :deep(.gt-container .gt-header::before) {
  content: '评论';
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.gitalk-container :deep(.gt-container .gt-header .gt-counts) {
  display: none;
}

.gitalk-container :deep(.gt-container .gt-user) {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.gitalk-container :deep(.gt-container .gt-user-pic img) {
  border-radius: 50%;
  border: 2px solid var(--line);
}

/* Comment input area */
.gitalk-container :deep(.gt-container .gt-header-comment) {
  margin-bottom: 16px;
}

.gitalk-container :deep(.gt-container .gt-header-textarea) {
  min-height: 100px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface-muted);
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.gitalk-container :deep(.gt-container .gt-header-textarea::placeholder) {
  color: var(--text-muted);
}

.gitalk-container :deep(.gt-container .gt-header-textarea:hover),
.gitalk-container :deep(.gt-container .gt-header-textarea:focus) {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.gitalk-container :deep(.gt-container .gt-header-preview) {
  min-height: 100px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface-muted);
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Controls: markdown tip + buttons */
.gitalk-container :deep(.gt-container .gt-header-controls) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.gitalk-container :deep(.gt-container .gt-header-controls-tip) {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.gitalk-container :deep(.gt-container .gt-header-controls .gt-btn) {
  margin-left: 10px;
}

/* Buttons */
.gitalk-container :deep(.gt-container .gt-btn) {
  padding: 8px 16px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface-muted);
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gitalk-container :deep(.gt-container .gt-btn:hover) {
  background: var(--surface);
  border-color: var(--accent);
  color: var(--accent);
}

.gitalk-container :deep(.gt-container .gt-btn-public) {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}

.gitalk-container :deep(.gt-container .gt-btn-public:hover) {
  filter: brightness(1.1);
  color: #ffffff;
}

.gitalk-container :deep(.gt-container .gt-btn.is--disable) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Login button */
.gitalk-container :deep(.gt-container .gt-btn-login) {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}

.gitalk-container :deep(.gt-container .gt-btn-login:hover) {
  filter: brightness(1.1);
  color: #ffffff;
}

/* Links */
.gitalk-container :deep(.gt-container .gt-link) {
  color: var(--accent);
  text-decoration: none;
}

.gitalk-container :deep(.gt-container .gt-link:hover) {
  text-decoration: underline;
}

/* Comments list */
.gitalk-container :deep(.gt-container .gt-comments) {
  margin-top: 20px;
}

.gitalk-container :deep(.gt-container .gt-comment) {
  margin-bottom: 16px;
}

.gitalk-container :deep(.gt-container .gt-comment-content) {
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-muted);
  transition: background 0.2s ease;
}

.gitalk-container :deep(.gt-container .gt-comment-content:hover) {
  background: var(--surface);
}

.gitalk-container :deep(.gt-container .gt-comment-username) {
  color: var(--text);
  font-weight: 600;
  text-decoration: none;
}

.gitalk-container :deep(.gt-container .gt-comment-username:hover) {
  color: var(--accent);
}

.gitalk-container :deep(.gt-container .gt-comment-date) {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.gitalk-container :deep(.gt-container .gt-comment-text) {
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.6;
}

.gitalk-container :deep(.gt-container .gt-comment-body) {
  color: var(--text);
}

.gitalk-container :deep(.gt-container .gt-comment-body a) {
  color: var(--accent);
}

.gitalk-container :deep(.gt-container .gt-comment-like,
  .gt-container .gt-comment-edit,
  .gt-container .gt-comment-reply) {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.gitalk-container :deep(.gt-container .gt-comment-like:hover,
  .gt-container .gt-comment-edit:hover,
  .gt-container .gt-comment-reply:hover) {
  color: var(--accent);
}

/* Empty state / initing / error */
.gitalk-container :deep(.gt-container .gt-comments-null) {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.gitalk-container :deep(.gt-container .gt-initing) {
  color: var(--text-muted);
  text-align: center;
  padding: 40px 16px;
}

.gitalk-container :deep(.gt-container .gt-error) {
  padding: 16px;
  border-radius: 10px;
  background: rgba(220, 38, 38, 0.1);
  color: #ef4444;
  text-align: center;
  font-size: 0.9rem;
}

/* Pagination */
.gitalk-container :deep(.gt-container .gt-comments-controls .gt-btn) {
  margin: 0 4px;
}

/* Avatar sizing consistency */
.gitalk-container :deep(.gt-container .gt-avatar img) {
  border-radius: 50%;
}

/* Markdown content inside comments */
.gitalk-container :deep(.gt-container .gt-comment-body .markdown-body) {
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.6;
}

.gitalk-container :deep(.gt-container .gt-comment-body .markdown-body pre) {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.gitalk-container :deep(.gt-container .gt-comment-body .markdown-body code) {
  background: var(--surface);
  color: var(--text);
}

/* 移动端减少内边距，避免评论框过窄 */
@media (max-width: 640px) {
  .gitalk-section {
    padding: 12px;
    border-radius: 10px;
  }

  .gitalk-container :deep(.gt-container .gt-header-controls) {
    flex-wrap: wrap;
    gap: 10px;
  }

  .gitalk-container :deep(.gt-container .gt-header-controls-tip) {
    width: 100%;
  }

  .gitalk-container :deep(.gt-container .gt-btn) {
    flex: 1;
    margin-left: 0;
  }
}
</style>
