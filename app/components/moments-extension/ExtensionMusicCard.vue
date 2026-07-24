<template>
  <ExtensionCardShell>
    <div class="ext-music">
      <div class="ext-icon">
        <Icon name="lucide:music" />
      </div>
      <div class="ext-meta">
        <span class="ext-title">外链音乐</span>
        <span class="ext-desc">{{ displayDomain }}</span>
      </div>
      <a v-if="safeUrl" :href="safeUrl" target="_blank" rel="noopener noreferrer" class="ext-play">
        <Icon name="lucide:play" />
      </a>
    </div>
  </ExtensionCardShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ApiMusicExtensionPayload } from '../../types/moment'
import ExtensionCardShell from './ExtensionCardShell.vue'

const props = defineProps<{ payload: ApiMusicExtensionPayload }>()
const audioRef = ref<HTMLAudioElement | null>(null)

const safeUrl = computed(() => {
  try {
    const url = new URL(props.payload.url)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.href
  } catch {
    return ''
  }
})

const displayDomain = computed(() => {
  try {
    return new URL(props.payload.url).hostname.replace(/^www\./, '')
  } catch {
    return props.payload.url
  }
})
</script>
