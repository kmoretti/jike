<template>
  <ExtensionCardShell>
    <a v-if="safeUrl" :href="safeUrl" target="_blank" rel="noopener noreferrer" class="ext-link">
      <div class="ext-card">
        <div class="ext-icon">
          <Icon name="lucide:link" />
        </div>
        <div class="ext-meta">
          <span class="ext-title">{{ payload.title || displayDomain }}</span>
          <span class="ext-desc">{{ displayDomain }}</span>
        </div>
      </div>
    </a>
    <div v-else class="ext-card">
      <div class="ext-icon">
        <Icon name="lucide:link" />
      </div>
      <div class="ext-meta">
        <span class="ext-title">{{ payload.title }}</span>
        <span class="ext-desc">{{ payload.site }}</span>
      </div>
    </div>
  </ExtensionCardShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WebsiteExtensionPayload } from '../../types/moment'
import ExtensionCardShell from './ExtensionCardShell.vue'

const props = defineProps<{ payload: WebsiteExtensionPayload }>()

const safeUrl = computed(() => {
  try {
    const url = new URL(props.payload.site)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.href
  } catch {
    return ''
  }
})

const displayDomain = computed(() => {
  try {
    return new URL(props.payload.site).hostname.replace(/^www\./, '')
  } catch {
    return props.payload.site
  }
})
</script>
