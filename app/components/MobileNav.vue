<template>
  <nav class="mobile-nav" aria-label="移动端导航">
    <NuxtLink to="/" class="mobile-nav-item">
      <Icon name="lucide:house" />
      <span>首页</span>
    </NuxtLink>
    <button class="mobile-nav-item" type="button" @click="$emit('refresh')">
      <Icon name="lucide:refresh-cw" />
      <span>刷新</span>
    </button>
    <button class="mobile-nav-item" type="button" @click="sheetOpen = true">
      <Icon name="lucide:menu" />
      <span>更多</span>
    </button>

    <Teleport to="body">
      <div v-if="sheetOpen" class="sheet" role="dialog" aria-modal="true" aria-label="更多导航">
        <button class="sheet-backdrop" type="button" aria-label="关闭" @click="sheetOpen = false" />
        <div class="sheet-panel">
          <div class="sheet-grid">
            <button class="sheet-item" type="button" :title="themeLabel" @click="toggleTheme">
              <Icon :name="themeIcon" />
              <span>{{ themeShort }}</span>
            </button>
            <NuxtLink
              v-for="item in navItems"
              :key="item.label"
              :to="item.to"
              :href="item.href"
              class="sheet-item"
              :external="!!item.href"
              :target="item.href ? '_blank' : undefined"
              :rel="item.href ? 'noopener noreferrer' : undefined"
              :title="item.label"
              @click="sheetOpen = false"
            >
              <Icon :name="item.icon" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </div>
          <button class="sheet-close" type="button" @click="sheetOpen = false">关闭</button>
        </div>
      </div>
    </Teleport>
  </nav>
</template>

<script setup lang="ts">
import { jikeConfig, type JikeNavItem } from '../../config'
import { useColorMode } from '#imports'

defineEmits<{ refresh: [] }>()

const sheetOpen = ref(false)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const navItems = jikeConfig.nav as readonly JikeNavItem[]

const themeLabel = computed(() => {
  if (colorMode.preference === 'system') return '跟随系统'
  return isDark.value ? '深色模式' : '浅色模式'
})
const themeShort = computed(() => {
  if (colorMode.preference === 'system') return '自动'
  return isDark.value ? '深' : '浅'
})
const themeIcon = computed(() => {
  if (colorMode.preference === 'system') return 'lucide:monitor'
  return isDark.value ? 'lucide:sun' : 'lucide:moon'
})

function toggleTheme() {
  if (colorMode.preference === 'system') {
    colorMode.preference = 'dark'
  } else if (colorMode.preference === 'dark') {
    colorMode.preference = 'light'
  } else {
    colorMode.preference = 'system'
  }
}
</script>
