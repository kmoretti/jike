<template>
  <article class="memo-card" :class="{ pinned: moment.pinnedOrder > 0, sponsored: moment.isAd }" :id="`memo-${moment.id}`">
    <div class="memo-layout">
      <div class="memo-side">
        <img class="memo-avatar" :src="jikeConfig.site.profile.avatar" :alt="jikeConfig.site.profile.nickname" />
      </div>
      <div class="memo-body">
        <div class="memo-header">
          <NuxtLink class="memo-author-name" to="/">{{ jikeConfig.site.profile.nickname }}</NuxtLink>
          <div class="memo-status">
            <span v-if="moment.pinnedOrder > 0" class="meta-badge pinned-badge">置顶</span>
            <span v-if="moment.isAd" class="meta-badge ad-badge">推广</span>
          </div>
        </div>
        <MemoContent :content="moment.content" />
        <ExtensionRenderer :extension="moment.extension" />
        <MemoMedia :media="moment.media" />
        <MusicPreview v-if="legacyMusic" :music="legacyMusic" />
        <div v-if="moment.tags.length" class="memo-tags">
          <NuxtLink v-for="tag in moment.tags" :key="tag" :to="`/tags/${encodeURIComponent(tag)}`">#{{ tag }}</NuxtLink>
        </div>
        <div class="memo-footer">
          <NuxtLink :to="`/memo/${moment.id}`" class="memo-date">{{ formatDate(moment.createdAt) }}</NuxtLink>
          <a v-if="moment.messageLink" class="source-link" :href="moment.messageLink" target="_blank" rel="noopener noreferrer">来源 <Icon name="lucide:arrow-up-right" /></a>
          <MemoReactions :moment="moment" @change="$emit('reaction', $event)" />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { jikeConfig } from '../../config'
import type { JikeReaction } from '../../config'
import type { Moment } from '../types/moment'
import ExtensionRenderer from './moments-extension/ExtensionRenderer.vue'

const props = defineProps<{ moment: Moment }>()
defineEmits<{ reaction: [reaction: JikeReaction] }>()

const legacyMusic = computed(() => {
  const ext = props.moment.extension
  if (!ext || !('music' in ext)) return null
  return ext.music ?? null
})

function formatDate(value: number) {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value * 1000))
}
</script>