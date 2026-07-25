<template>
  <ExtensionCardShell>
    <a :href="payload.repo_url" target="_blank" rel="noopener noreferrer" class="ext-link">
      <div class="ext-card">
        <div class="ext-icon">
          <Icon name="lucide:github" />
        </div>
        <div class="ext-meta">
          <span class="ext-title">{{ repoName }}</span>
          <p class="ext-desc">{{ payload.repo_url }}</p>
        </div>
      </div>
    </a>
  </ExtensionCardShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GithubExtensionPayload } from '../../types/moment'
import ExtensionCardShell from './ExtensionCardShell.vue'

const props = defineProps<{ payload: GithubExtensionPayload }>()

const repoName = computed(() => {
  const url = props.payload.repo_url.replace(/\/+$/, '')
  const match = url.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/i)
  if (match) return match[1]
  const parts = url.split('/')
  return parts.slice(-2).join('/')
})
</script>
