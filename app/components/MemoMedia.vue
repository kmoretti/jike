<template>
  <div v-if="media.length" class="memo-media" :class="`media-count-${Math.min(media.length, 4)}`">
    <figure v-for="item in media" :key="item.id" class="media-item">
      <video v-if="item.isVideo" controls preload="metadata" playsinline :src="item.url">
        你的浏览器不支持视频播放。
      </video>
      <img v-else :src="item.url" :alt="item.name || '动态图片'" loading="lazy" decoding="async">
    </figure>
  </div>
</template>

<script setup lang="ts">
import type { MomentMedia } from '../types/moment'
defineProps<{ media: MomentMedia[] }>()
</script>
