<template>
  <button
    v-show="visible"
    type="button"
    class="scroll-to-top"
    aria-label="回到顶部"
    @click="scrollToTop"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m18 15-6-6-6 6" />
    </svg>
  </button>
</template>

<script setup lang="ts">
const { y } = useWindowScroll()

const visible = computed(() => y.value > 300)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  z-index: 20;
  right: 16px;
  bottom: 92px;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(12px);
  color: var(--text-muted);
  font-size: 1.1rem;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: opacity .2s ease, transform .2s ease, color .2s ease;
}

.scroll-to-top:hover {
  color: var(--accent);
  transform: translateY(-2px);
}

@media (min-width: 641px) {
  .scroll-to-top { display: none; }
}
</style>
