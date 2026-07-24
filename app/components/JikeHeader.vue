<template>
  <header class="site-header">
    <div class="profile-cover" :style="{ backgroundImage: `url(${jikeConfig.site.profile.cover})` }">
      <div class="profile-cover-shade"></div>
      <aside class="side-rail" aria-label="侧边导航">
        <button
          class="rail-item"
          type="button"
          :title="themeLabel"
          :aria-label="`切换主题，当前 ${themeLabel}`"
          @click="toggleTheme"
        >
          <Icon :name="themeIcon" />
          <span class="rail-label">{{ themeShort }}</span>
        </button>
        <NuxtLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          :href="item.href"
          class="rail-item"
          :external="!!item.href"
          :target="item.href ? '_blank' : undefined"
          :rel="item.href ? 'noopener noreferrer' : undefined"
          :title="item.label"
          :aria-label="item.label"
        >
          <Icon :name="item.icon" />
          <span class="rail-label">{{ item.label }}</span>
        </NuxtLink>
      </aside>
      <NuxtLink to="/" class="profile-identity">
        <div class="profile-copy">
          <strong>{{ jikeConfig.site.profile.nickname }}</strong>
          <span>{{ jikeConfig.site.profile.signature }}</span>
        </div>
        <img class="profile-avatar" :src="jikeConfig.site.profile.avatar" :alt="jikeConfig.site.profile.nickname" />
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { jikeConfig, type JikeNavItem } from '../../config'
import { useColorMode } from '#imports'

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
