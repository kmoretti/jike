<template>
  <section class="empty-state">
    <span class="empty-mark">∅</span>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <button v-if="actionLabel" type="button" @click="$emit('action')">{{ actionLabel }}</button>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; message: string; actionLabel?: string }>()
defineEmits<{ action: [] }>()
</script>
