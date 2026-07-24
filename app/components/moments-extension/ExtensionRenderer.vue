<template>
  <template v-if="apiExtension">
    <GithubCard v-if="apiExtension.type === 'github'" :payload="apiExtension.payload" />
    <WebsiteCard v-else-if="apiExtension.type === 'website'" :payload="apiExtension.payload" />
    <LocationCard v-else-if="apiExtension.type === 'location'" :payload="apiExtension.payload" />
    <ExtensionMusicCard v-else-if="apiExtension.type === 'music'" :payload="apiExtension.payload" />
    <TweetCard v-else-if="apiExtension.type === 'tweet'" :payload="apiExtension.payload" />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MomentExtension, ApiMomentExtension } from '../../types/moment'
import GithubCard from './GithubCard.vue'
import WebsiteCard from './WebsiteCard.vue'
import LocationCard from './LocationCard.vue'
import ExtensionMusicCard from './ExtensionMusicCard.vue'
import TweetCard from './TweetCard.vue'

const props = defineProps<{
  extension: MomentExtension | null
}>()

const apiExtension = computed<ApiMomentExtension | null>(() => {
  if (!props.extension) return null
  if ('type' in props.extension) {
    return props.extension as ApiMomentExtension
  }
  return null
})
</script>
