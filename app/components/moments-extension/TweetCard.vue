<template>
  <ExtensionCardShell>
    <a v-if="safeUrl" :href="safeUrl" target="_blank" rel="noopener noreferrer" class="ext-link">
      <div class="ext-card">
        <div class="ext-icon">
          <Icon name="lucide:message-circle" />
        </div>
        <div class="ext-meta">
          <span class="ext-title">@{{ payload.username }}</span>
          <span class="ext-desc">查看推文</span>
        </div>
      </div>
    </a>
    <div v-else class="ext-card">
      <div class="ext-icon">
        <Icon name="lucide:message-circle" />
      </div>
      <div class="ext-meta">
        <span class="ext-title">@{{ payload.username }}</span>
        <span class="ext-desc">推文</span>
      </div>
    </div>
  </ExtensionCardShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TweetExtensionPayload } from '../../types/moment'
import ExtensionCardShell from './ExtensionCardShell.vue'

const props = defineProps<{ payload: TweetExtensionPayload }>()

const safeUrl = computed(() => {
  try {
    const url = new URL(props.payload.url)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.href
  } catch {
    return ''
  }
})
</script>
