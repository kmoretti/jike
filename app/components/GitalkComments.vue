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

const isDark = computed(() => colorMode.value === 'dark')
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

/* 暗色模式通过滤镜反转，并对头像/图标二次反转保持正常 */
.gitalk-section.is-dark .gitalk-container :deep(.gt-container) {
  filter: invert(1) hue-rotate(180deg);
}

.gitalk-section.is-dark .gitalk-container :deep(.gt-container .gt-avatar img),
.gitalk-section.is-dark .gitalk-container :deep(.gt-container .gt-ico svg),
.gitalk-section.is-dark .gitalk-container :deep(.gt-container .gt-ico-text),
.gitalk-section.is-dark .gitalk-container :deep(.gt-container .gt-btn-icon svg) {
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
