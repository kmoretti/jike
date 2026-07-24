<template>
  <section class="timeline-shell">
    <NuxtLink class="back-link" to="/">← 返回时间线</NuxtLink>
    <div class="timeline-intro compact-intro">
      <p class="eyebrow">标签动态</p>
      <h1 class="timeline-title">#{{ tag }}</h1>
    </div>
    <div class="memo-list">
      <MemoCard v-for="moment in filteredMoments" :key="moment.id" :moment="moment" @reaction="reaction => toggle(moment, reaction)" />
    </div>
    <EmptyState v-if="hasLoaded && !filteredMoments.length" title="没有匹配的动态" message="换一个标签试试看。" />
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const tag = decodeURIComponent(String(route.params.tag))
const { moments, hasLoaded, load } = useJikeMoments()
const { toggle } = useMomentReactions()
const filteredMoments = computed(() => moments.value.filter(moment => moment.tags.includes(tag)))
onMounted(() => { if (!hasLoaded.value) load() })
</script>

<style scoped>
.back-link { display: inline-block; margin-bottom: 24px; color: var(--text-muted); text-decoration: none; }
.back-link:hover { color: var(--accent); }
.compact-intro { margin-bottom: 30px; }
</style>
