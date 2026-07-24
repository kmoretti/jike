<template>
  <ExtensionCardShell>
    <button type="button" class="ext-location" @click="open = !open">
      <Icon name="lucide:map-pin" />
      <span class="ext-location-text">{{ displayText }}</span>
      <Icon name="lucide:chevron-down" class="location-arrow" :class="{ 'is-open': open }" />
    </button>
    <div v-if="open && hasValidCoords" class="ext-location-map">
      <iframe
        width="100%"
        height="180"
        frameborder="0"
        style="border:0"
        :src="mapUrl"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
    </div>
  </ExtensionCardShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LocationExtensionPayload } from '../../types/moment'
import ExtensionCardShell from './ExtensionCardShell.vue'

const props = defineProps<{ payload: LocationExtensionPayload }>()
const open = ref(false)

const hasValidCoords = computed(() => {
  return Number.isFinite(props.payload.latitude) && Number.isFinite(props.payload.longitude)
})

const coordsText = computed(() => `${props.payload.latitude.toFixed(4)}°, ${props.payload.longitude.toFixed(4)}°`)
const displayText = computed(() => props.payload.placeholder || coordsText.value)

const mapUrl = computed(() => {
  const lat = props.payload.latitude
  const lon = props.payload.longitude
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}`)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`
})
</script>
