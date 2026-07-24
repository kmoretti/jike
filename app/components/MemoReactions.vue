<template>
  <div class="memo-reactions" aria-label="动态反应">
    <button
      v-for="reaction in jikeConfig.reactions"
      :key="reaction"
      type="button"
      class="reaction-button"
      :class="{ selected: moment.selectedReaction === reaction }"
      :disabled="pending"
      :aria-pressed="moment.selectedReaction === reaction"
      @click="$emit('change', reaction)"
    >
      <span>{{ reaction }}</span>
      <small>{{ moment.reactions[reaction] || 0 }}</small>
    </button>
  </div>
</template>

<script setup lang="ts">
import { jikeConfig, type JikeReaction } from '../../config'
import type { Moment } from '../types/moment'
defineProps<{ moment: Moment; pending?: boolean }>()
defineEmits<{ change: [reaction: JikeReaction] }>()
</script>
