<template>
  <section id="admin" class="admin-shell">
    <NuxtLink to="/" class="page-back">
      <Icon name="lucide:arrow-left" />
      返回首页
    </NuxtLink>
    <h1 class="page-title">后台管理</h1>

    <div v-if="!jikeConfig.site.adminEmbed || turnstileEnabled" class="admin-fallback">
      <p>{{ turnstileEnabled ? '当前后台启用了 Turnstile 验证，为避免域名冲突，请在新标签页中打开。' : '后台管理需要在新标签页中打开。' }}</p>
      <a class="admin-cta" :href="jikeConfig.site.adminURL" target="_blank" rel="noopener noreferrer">
        <Icon name="lucide:external-link" />
        打开后台
      </a>
    </div>

    <div v-else-if="errored" class="admin-fallback">
      <p>无法在嵌入页面中显示后台，请直接在新标签页中访问。</p>
      <a class="admin-cta" :href="jikeConfig.site.adminURL" target="_blank" rel="noopener noreferrer">
        <Icon name="lucide:external-link" />
        打开后台
      </a>
    </div>

    <iframe
      v-else
      ref="iframe"
      class="admin-frame"
      :src="jikeConfig.site.adminURL"
      title="后台管理"
      @load="onLoad"
      @error="onError"
    />
  </section>
</template>

<script setup lang="ts">
import { jikeConfig } from '../../config'

useHead({ title: `后台 · ${jikeConfig.site.name}`, meta: [{ name: 'description', content: '后台管理' }] })

const api = useJikeApi()
const iframe = ref<HTMLIFrameElement | null>(null)
const errored = ref(false)
const turnstileEnabled = ref(false)
let timeout: ReturnType<typeof setTimeout> | null = null
let loaded = false

async function loadVerifyConfig() {
  if (!import.meta.client) return
  try {
    const config = await api.getVerifyConfig()
    turnstileEnabled.value = config.turnstile.enable
  } catch {
    turnstileEnabled.value = false
  }
}

function onLoad() {
  loaded = true
  if (timeout) { clearTimeout(timeout); timeout = null }
  // 部分后台响应头 会触发 XFO 拒绝但 iframe onload 仍触发；
  // 检查 iframe 是否有有效内容宽度即可判定是否被拒。Sandbox/cross-origin 限制 getComputedStyle 等访问，
  // 但 `contentDocument` 在异常情况下可能为 null —— 若为 null 又无法读 visible，我们改在 onError 回退。
  try {
    const doc = iframe.value?.contentDocument
    if (doc && doc.body && doc.body.children.length === 0) {
      onError()
    }
  } catch {
    // 跨域 contentDocument 不可访问，无法 100% 判断，依靠 onerror 与延时兜底
  }
}

function onError() {
  if (timeout) { clearTimeout(timeout); timeout = null }
  errored.value = true
}

onMounted(async () => {
  await loadVerifyConfig()
  // 6 秒未触发 load 也回退
  timeout = setTimeout(() => { if (!loaded) onError() }, 6000)
})

onBeforeUnmount(() => { if (timeout) clearTimeout(timeout) })
</script>

<style scoped>
.admin-shell { padding: 24px 16px 84px; }
.admin-frame { width: 100%; min-height: 75vh; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
.admin-fallback { display: grid; place-items: center; gap: 12px; padding: 60px 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-muted); text-align: center; color: var(--text-muted); }
.admin-cta { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; background: var(--accent-soft); color: var(--accent); font-size: .9rem; font-weight: 600; }
.admin-cta:hover { background: var(--accent); color: #fff; }
</style>
