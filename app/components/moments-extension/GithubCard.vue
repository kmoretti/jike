<template>
  <ExtensionCardShell>
    <a :href="payload.repo_url" target="_blank" rel="noopener noreferrer" class="ext-link">
      <div class="ext-card">
        <div class="ext-icon">
          <Icon name="lucide:github" />
        </div>
        <div class="ext-meta">
          <span class="ext-title">{{ repoData?.full_name || repoData?.name || repoName }}</span>
          <p class="ext-desc">{{ repoData?.description || repoName }}</p>
          <div v-if="repoData" class="ext-sub">
            <Icon name="lucide:star" />
            <span>{{ formatCount(repoData.stargazers_count) }}</span>
            <span class="ext-sub-divider" />
            <Icon name="lucide:git-fork" />
            <span>{{ formatCount(repoData.forks_count) }}</span>
          </div>
        </div>
      </div>
    </a>
  </ExtensionCardShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { GithubExtensionPayload } from '../../types/moment'
import ExtensionCardShell from './ExtensionCardShell.vue'

interface GithubRepository {
  name: string
  full_name?: string
  description: string | null
  stargazers_count: number
  forks_count: number
  owner?: { avatar_url?: string }
}

const props = defineProps<{ payload: GithubExtensionPayload }>()

const repoPath = computed(() => {
  const url = props.payload.repo_url.replace(/\/+$/, '')
  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/i)
  return match ? `${match[1]}/${match[2]}` : ''
})

const repoName = computed(() => {
  if (repoPath.value) return repoPath.value
  const parts = props.payload.repo_url.replace(/\/+$/, '').split('/')
  return parts.slice(-2).join('/')
})

const repoData = ref<GithubRepository | null>(null)

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(value)
}

onMounted(async () => {
  if (!repoPath.value) return
  try {
    const response = await fetch(`https://api.github.com/repos/${repoPath.value}`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!response.ok) return
    repoData.value = (await response.json()) as GithubRepository
  } catch {
    repoData.value = null
  }
})
</script>
