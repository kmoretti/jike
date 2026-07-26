<template>
  <section class="my-site-info">
    <h2 class="info-title">本站信息</h2>
    <p class="info-desc">
      如果你愿意在贵站添加 <strong>{{ mySite.name }}</strong>，可以直接使用以下信息：
    </p>

    <div class="info-card">
      <div v-for="field in fields" :key="field.key" class="info-row">
        <div class="info-label">{{ field.label }}</div>
        <div class="info-value-wrap">
          <span class="info-value" :title="field.value">{{ field.value }}</span>
          <button
            type="button"
            class="copy-btn"
            :class="{ copied: copiedKey === field.key }"
            :title="copiedKey === field.key ? '已复制' : '复制'"
            @click="copyField(field.key, field.value)"
          >
            <Icon :name="copiedKey === field.key ? 'lucide:check' : 'lucide:copy'" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { jikeConfig } from '../../config'

const { copy, isSupported } = useClipboard()
const mySite = jikeConfig.friendLink.mySite

const copiedKey = ref<string | null>(null)
let resetTimer: ReturnType<typeof setTimeout> | null = null

const fields = [
  { key: 'name', label: '站点名称', value: mySite.name },
  { key: 'link', label: '站点链接', value: mySite.link },
  { key: 'avatar', label: '头像地址', value: mySite.avatar },
  { key: 'descr', label: '站点描述', value: mySite.descr },
  { key: 'siteshot', label: '站点截图', value: mySite.siteshot },
  { key: 'atom', label: 'RSS 订阅', value: mySite.atom },
]

async function copyField(key: string, value: string) {
  if (!isSupported.value) return
  await copy(value)
  copiedKey.value = key
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    copiedKey.value = null
  }, 2000)
}
</script>

<style scoped>
.my-site-info {
  margin-top: 32px;
}

.info-title {
  margin: 0 0 6px;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
}

.info-desc {
  margin: 0 0 16px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.info-desc strong {
  color: var(--text);
}

.info-card {
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
}

.info-row {
  display: grid;
  gap: 4px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}

.info-row:first-child {
  padding-top: 0;
}

.info-row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.info-value-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.info-value {
  flex: 1;
  min-width: 0;
  font-size: 0.88rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface-muted);
  color: var(--text-muted);
  flex-shrink: 0;
}

.copy-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.copy-btn.copied {
  border-color: #22c55e;
  color: #22c55e;
}

@media (max-width: 640px) {
  .my-site-info {
    margin-top: 24px;
  }
}
</style>
