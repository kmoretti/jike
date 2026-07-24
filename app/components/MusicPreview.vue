<template>
  <div class="music-preview" aria-label="音乐播放器">
    <div v-if="isMeting" ref="metingContainer" class="meting-container"></div>
    <div v-else-if="isExternal" class="external-music-card">
      <div class="external-music-cover">
        <img v-if="external.cover" :src="external.cover" :alt="external.title || '封面'" />
        <Icon v-else name="lucide:music" />
      </div>
      <div class="external-music-info">
        <h4 class="external-music-title">{{ external.title || '未知歌曲' }}</h4>
        <p class="external-music-artist">{{ external.artist || '未知艺术家' }}</p>
        <audio ref="audioRef" controls class="external-music-player">
          <source :src="external.url" type="audio/mpeg">
          你的浏览器不支持音频播放。
        </audio>
        <div v-if="hasLyrics" class="external-music-lyrics">
          <div class="lyrics-toggle" @click="showLyrics = !showLyrics">
            <Icon :name="showLyrics ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
            <span>{{ showLyrics ? '收起歌词' : '显示歌词' }}</span>
          </div>
          <div v-show="showLyrics" class="lyrics-content">
            <p v-for="(line, index) in lyricsLines" :key="index" class="lyrics-line">
              {{ line || '&nbsp;' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { MusicExtension, ExternalMusic } from '../types/moment'
import { jikeConfig } from '../../config'

const props = defineProps<{ music: MusicExtension }>()
const metingContainer = ref<HTMLElement | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const showLyrics = ref(false)
const lyricsText = ref('')

const isMeting = computed(() => {
  return typeof props.music === 'object' && 'server' in props.music && 'type' in props.music && 'id' in props.music
})

const isExternal = computed(() => {
  return typeof props.music === 'object' && 'url' in props.music
})

const external = computed(() => {
  if (!isExternal.value) return { url: '', cover: '', title: '', artist: '', lrc: '', lrcUrl: '' }
  return props.music as ExternalMusic
})

const hasLyrics = computed(() => {
  return !!external.value.lrc || !!external.value.lrcUrl
})

const lyricsLines = computed(() => {
  return lyricsText.value.split('\n')
})

async function loadLyrics() {
  if (external.value.lrc) {
    lyricsText.value = external.value.lrc
    return
  }
  if (external.value.lrcUrl) {
    try {
      const response = await fetch(external.value.lrcUrl)
      if (response.ok) {
        lyricsText.value = await response.text()
      }
    } catch {
      lyricsText.value = ''
    }
  }
}

onMounted(() => {
  if (isMeting.value && metingContainer.value) {
    const metingMusic = props.music as { id: string; server: string; type: string; api?: string }
    const apiUrl = metingMusic.api || jikeConfig.music.metingApi
    const metingDiv = document.createElement('div')
    metingDiv.setAttribute('id', `meting-${Math.random().toString(36).slice(2)}`)
    metingDiv.setAttribute('data-id', metingMusic.id)
    metingDiv.setAttribute('data-server', metingMusic.server)
    metingDiv.setAttribute('data-type', metingMusic.type)
    metingDiv.setAttribute('data-api', apiUrl)
    metingDiv.setAttribute('data-fixed', 'false')
    metingDiv.setAttribute('data-autoplay', 'false')
    metingDiv.setAttribute('data-theme', '#c95d3b')
    metingContainer.value.appendChild(metingDiv)
    if ((window as unknown as { MetingJS?: () => void }).MetingJS) {
      ;(window as unknown as { MetingJS: () => void }).MetingJS()
    }
  }
  if (isExternal.value && hasLyrics.value) {
    loadLyrics()
  }
})

watch(() => props.music, () => {
  if (isExternal.value && hasLyrics.value) {
    loadLyrics()
  }
})
</script>

<style scoped>
.music-preview { margin-top: 18px; }
.meting-container :deep(.aplayer) { margin: 0; border-radius: 4px; }
.external-music-card { display: flex; gap: 12px; padding: 14px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface-muted); }
.external-music-cover { flex-shrink: 0; width: 64px; height: 64px; border-radius: 4px; overflow: hidden; background: var(--bg); }
.external-music-cover img { width: 100%; height: 100%; object-fit: cover; }
.external-music-cover svg { width: 64px; height: 64px; padding: 16px; color: var(--text-muted); }
.external-music-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.external-music-title { margin: 0; font-size: .9rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.external-music-artist { margin: 0; color: var(--text-muted); font-size: .75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.external-music-player { width: 100%; margin-top: 6px; border: 0; }
.external-music-lyrics { margin-top: 8px; border-top: 1px solid var(--line); padding-top: 8px; }
.lyrics-toggle { display: flex; align-items: center; gap: 4px; font-size: .75rem; color: var(--text-muted); cursor: pointer; }
.lyrics-toggle:hover { color: var(--text); }
.lyrics-content { margin-top: 8px; max-height: 150px; overflow-y: auto; font-size: .8rem; line-height: 1.6; color: var(--text-secondary); }
.lyrics-line { margin: 2px 0; }
</style>