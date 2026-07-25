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
    proxy: (runtimeConfig.public.gitalkProxy as string | undefined) || jikeConfig.gitalk.proxy,
  }
}

function patchGitHubApiProxy() {
  if (typeof window === 'undefined') return
  if ((window as any).__gitalkApiPatched) return
  ;(window as any).__gitalkApiPatched = true

  const useProxy = (runtimeConfig.public.gitalkUseProxy as boolean | undefined)
  if (!useProxy) return

  const GITHUB_API = 'https://api.github.com/'
  const PROXY_API = `${window.location.origin}/api/github/`

  const originalOpen = XMLHttpRequest.prototype.open as (method: string, url: string, ...rest: any[]) => void
  XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: any[]) {
    const urlStr = typeof url === 'string' ? url : url.toString()
    if (urlStr.startsWith(GITHUB_API)) {
      const proxied = urlStr.replace(GITHUB_API, PROXY_API)
      return originalOpen.call(this, method, proxied, ...rest)
    }
    return originalOpen.call(this, method, urlStr, ...rest)
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
  border-radius: 8px;
  background: var(--surface-muted);
  box-shadow: inset 0 1px 0 var(--line);
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
}

/* 暗色模式：先给容器明亮的背景和深色文字，再整体滤镜反转，
   避免透明区域继承页面暗色背景后文字也变成深色 */
.gitalk-section.is-dark .gitalk-container :deep(.gt-container),
.dark .gitalk-section .gitalk-container :deep(.gt-container) {
  background-color: #ffffff;
  color: #000000;
  filter: invert(1) hue-rotate(180deg) contrast(1.05);
}

.gitalk-section.is-dark .gitalk-container :deep(.gt-container .gt-avatar img),
.gitalk-section.is-dark .gitalk-container :deep(.gt-container .gt-ico svg),
.gitalk-section.is-dark .gitalk-container :deep(.gt-container .gt-ico-text),
.gitalk-section.is-dark .gitalk-container :deep(.gt-container .gt-btn-icon svg),
.dark .gitalk-section .gitalk-container :deep(.gt-container .gt-avatar img),
.dark .gitalk-section .gitalk-container :deep(.gt-container .gt-ico svg),
.dark .gitalk-section .gitalk-container :deep(.gt-container .gt-ico-text),
.dark .gitalk-section .gitalk-container :deep(.gt-container .gt-btn-icon svg) {
  filter: invert(1) hue-rotate(180deg);
}

/* 移动端减少内边距，避免评论框过窄 */
@media (max-width: 640px) {
  .gitalk-section {
    padding: 12px;
    border-radius: 6px;
  }
}
</style>
