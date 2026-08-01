<template>
  <section class="friend-apply-section">
    <h2 class="apply-title">友链申请</h2>
    <p class="apply-desc">填写以下信息申请交换友链，审核通过后会显示在上方列表中。</p>

    <div class="conditions-card">
      <h3 class="conditions-title">申请条件</h3>
      <p class="conditions-sub">请先确认满足以下条件：</p>
      <label v-for="(condition, index) in conditions" :key="index" class="condition-label">
        <input v-model="condition.checked" type="checkbox" class="condition-checkbox">
        <span class="condition-text" v-html="condition.text" />
      </label>
      <div class="condition-hint" :class="{ hidden: conditionsMet }">
        <Icon name="lucide:alert-triangle" /> 请先勾选所有条件后再填写申请表单
      </div>
    </div>

    <div v-show="conditionsMet" class="apply-card">
      <div class="mode-switch">
        <button
          type="button"
          class="mode-btn"
          :class="{ active: mode === 'apply' }"
          @click="mode = 'apply'"
        >
          申请友链
        </button>
        <button
          type="button"
          class="mode-btn"
          :class="{ active: mode === 'update' }"
          @click="mode = 'update'"
        >
          更新友链
        </button>
      </div>

      <form v-if="mode === 'apply'" class="apply-form" @submit.prevent="submitApply">
        <div class="form-field">
          <label class="field-label">站点名称 <span class="required">*</span></label>
          <input v-model="applyForm.name" class="field-input" required placeholder="站点名称">
        </div>
        <div class="form-field">
          <label class="field-label">站点地址 <span class="required">*</span></label>
          <input v-model="applyForm.link" class="field-input" type="url" required placeholder="https://example.com">
        </div>
        <div class="form-field">
          <label class="field-label">站点描述</label>
          <input v-model="applyForm.description" class="field-input" placeholder="例如：一个关于技术和设计的博客">
        </div>
        <div class="form-field">
          <label class="field-label">头像地址 <span class="required">*</span></label>
          <input v-model="applyForm.avatar" class="field-input" type="url" required placeholder="https://example.com/avatar.png">
        </div>
        <div class="form-field">
          <label class="field-label">站点截图</label>
          <input v-model="applyForm.snapshot" class="field-input" type="url" placeholder="站点截图链接">
        </div>
        <div class="form-field">
          <label class="field-label">联系邮箱</label>
          <input v-model="applyForm.email" class="field-input" type="email" placeholder="you@example.com">
          <p class="field-hint">选填，填写后可接收审核通知；不填则无法通过邮箱查询申请状态</p>
        </div>
        <div class="form-field">
          <label class="field-label">友链页面</label>
          <input v-model="applyForm.friend_link_page" class="field-input" type="url" placeholder="https://example.com/links">
        </div>
        <div class="form-field">
          <label class="field-label">RSS 订阅地址</label>
          <input v-model="applyForm.feed" class="field-input" type="url" placeholder="https://example.com/feed.xml">
        </div>
        <label class="toggle-field">
          <input v-model="applyForm.enable_rss" type="checkbox">
          <span>启用 RSS 订阅抓取</span>
        </label>
        <div v-if="turnstileEnabled" ref="turnstileEl" class="turnstile-widget" />
        <div v-if="error" class="form-error">{{ error }}</div>
        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交申请' }}
        </button>
      </form>

      <form v-else class="apply-form" @submit.prevent="submitUpdate">
        <div class="form-field">
          <label class="field-label">原站点地址 <span class="required">*</span></label>
          <input v-model="updateForm.original_url" class="field-input" type="url" required placeholder="原来的网站地址">
        </div>
        <div class="update-divider">
          <p>新的信息（只填需要修改的字段）</p>
        </div>
        <div class="form-field">
          <label class="field-label">新站点名称 <span class="required">*</span></label>
          <input v-model="updateForm.name" class="field-input" required placeholder="站点名称">
        </div>
        <div class="form-field">
          <label class="field-label">新站点地址 <span class="required">*</span></label>
          <input v-model="updateForm.link" class="field-input" type="url" required placeholder="https://example.com">
        </div>
        <div class="form-field">
          <label class="field-label">新站点描述</label>
          <input v-model="updateForm.description" class="field-input" placeholder="例如：一个关于技术和设计的博客">
        </div>
        <div class="form-field">
          <label class="field-label">新头像地址 <span class="required">*</span></label>
          <input v-model="updateForm.avatar" class="field-input" type="url" required placeholder="https://example.com/avatar.png">
        </div>
        <div class="form-field">
          <label class="field-label">新站点截图</label>
          <input v-model="updateForm.snapshot" class="field-input" type="url" placeholder="站点截图链接">
        </div>
        <div class="form-field">
          <label class="field-label">联系邮箱</label>
          <input v-model="updateForm.email" class="field-input" type="email" placeholder="you@example.com">
          <p class="field-hint">选填；若原友链登记了邮箱，建议填写一致以便校验归属</p>
        </div>
        <div class="form-field">
          <label class="field-label">新友链页面</label>
          <input v-model="updateForm.friend_link_page" class="field-input" type="url" placeholder="https://example.com/links">
        </div>
        <div class="form-field">
          <label class="field-label">新 RSS 订阅地址</label>
          <input v-model="updateForm.feed" class="field-input" type="url" placeholder="https://example.com/feed.xml">
        </div>
        <label class="toggle-field">
          <input v-model="updateForm.enable_rss" type="checkbox">
          <span>启用 RSS 订阅抓取</span>
        </label>
        <div v-if="turnstileEnabled" ref="turnstileElUpdate" class="turnstile-widget" />
        <div v-if="error" class="form-error">{{ error }}</div>
        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交更新' }}
        </button>
      </form>
    </div>

    <div v-if="success" class="success-card">
      <Icon name="lucide:circle-check" class="success-icon" />
      <h3>提交成功</h3>
      <p>{{ success }}</p>
      <button type="button" class="text-button" @click="resetAll">继续申请</button>
    </div>

    <div class="submissions-card">
      <div class="submissions-header">
        <h3 class="submissions-title">
          申请列表
          <span v-if="submissionsTotal > 0" class="submissions-count">共 {{ submissionsTotal }} 条</span>
        </h3>
        <div class="submissions-controls">
          <select v-model="statusFilter" class="filter-select" @change="loadSubmissions(1)">
            <option value="">全部状态</option>
            <option value="pending">未审批</option>
            <option value="survival">已通过</option>
            <option value="rejected">已拒绝</option>
            <option value="timeout">超时</option>
            <option value="error">错误</option>
          </select>
          <div class="search-wrap">
            <Icon name="lucide:search" class="search-icon" />
            <input v-model="searchKeyword" type="text" class="search-input" placeholder="搜索名称" @input="debounceSearch">
          </div>
        </div>
      </div>

      <div v-if="submissionsLoading" class="submissions-empty">加载中...</div>
      <div v-else-if="submissionsError" class="submissions-error">{{ submissionsError }}</div>
      <div v-else-if="submissions.length === 0" class="submissions-empty">暂无申请记录</div>
      <div v-else class="submissions-grid">
        <div v-for="item in submissions" :key="item.id" class="submission-item">
          <div class="submission-top">
            <span class="submission-name" :title="item.name">{{ item.name }}</span>
            <span class="submission-badge" :class="statusClass(item.status)">{{ statusText(item.status) }}</span>
          </div>
          <p class="submission-desc" :title="item.description">{{ item.description || '暂无描述' }}</p>
        </div>
      </div>

      <div v-if="submissionsTotalPages > 1" class="submissions-pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="submissionsPage <= 1"
          @click="loadSubmissions(submissionsPage - 1)"
        >
          <Icon name="lucide:chevron-left" />
        </button>
        <span class="page-info">{{ submissionsPage }} / {{ submissionsTotalPages }}</span>
        <button
          type="button"
          class="page-btn"
          :disabled="submissionsPage >= submissionsTotalPages"
          @click="loadSubmissions(submissionsPage + 1)"
        >
          <Icon name="lucide:chevron-right" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { jikeConfig } from '../../config'
import type { FriendLinkSubmission, PaginatedResponse } from '../types/api'

interface ApplyForm {
  name: string
  link: string
  avatar: string
  description: string
  email: string
  snapshot: string
  friend_link_page: string
  feed: string
  enable_rss: boolean
}

interface UpdateForm extends ApplyForm {
  original_url: string
}

const api = useJikeApi()
const colorMode = useColorMode()

const conditionSiteName = jikeConfig.friendLink?.applyConditionSiteName || jikeConfig.site.name

const conditions = ref([
  { checked: false, text: '我已添加 <strong>' + conditionSiteName + '</strong> 的友情链接' },
  { checked: false, text: '我的网站现在可以在中国大陆区域正常访问' },
  { checked: false, text: '网站内容符合中国大陆法律法规' },
  { checked: false, text: '我的链接主体为<strong>个人</strong>，网站类型为<strong>博客</strong>' },
  { checked: false, text: '网站域名不是免费域名（github.io、gitee.io 除外）' },
])

const conditionsMet = computed(() => conditions.value.every(c => c.checked))

const mode = ref<'apply' | 'update'>('apply')
const submitting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const turnstileEnabled = ref(false)
const turnstileSiteKey = ref('')
const turnstileEl = ref<HTMLElement | null>(null)
const turnstileElUpdate = ref<HTMLElement | null>(null)
let turnstileWidgetId: string | null = null
let turnstileWidgetIdUpdate: string | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

const applyForm = ref<ApplyForm>({
  name: '',
  link: '',
  avatar: '',
  description: '',
  email: '',
  snapshot: '',
  friend_link_page: '',
  feed: '',
  enable_rss: false,
})

const updateForm = ref<UpdateForm>({
  original_url: '',
  name: '',
  link: '',
  avatar: '',
  description: '',
  email: '',
  snapshot: '',
  friend_link_page: '',
  feed: '',
  enable_rss: false,
})

const submissions = ref<FriendLinkSubmission[]>([])
const submissionsLoading = ref(false)
const submissionsError = ref<string | null>(null)
const submissionsPage = ref(1)
const submissionsPageSize = ref(12)
const submissionsTotal = ref(0)
const submissionsTotalPages = computed(() => Math.ceil(submissionsTotal.value / submissionsPageSize.value))
const statusFilter = ref('')
const searchKeyword = ref('')

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: '未审批',
    survival: '已通过',
    rejected: '已拒绝',
    timeout: '超时',
    error: '错误',
  }
  return map[status] || status
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending: 'pending',
    survival: 'approved',
    rejected: 'rejected',
    timeout: 'timeout',
    error: 'error',
  }
  return map[status] || status
}

async function loadVerifyConfig() {
  if (!import.meta.client) return
  try {
    const config = await api.getVerifyConfig()
    turnstileEnabled.value = config.turnstile.enable
    turnstileSiteKey.value = config.turnstile.site_key || ''
  } catch {
    turnstileEnabled.value = false
  }
}

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve()
    if (document.querySelector('script[data-turnstile-script]')) {
      return resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.setAttribute('data-turnstile-script', 'true')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile 脚本加载失败'))
    document.head.appendChild(script)
  })
}

async function renderTurnstile(container: HTMLElement | null) {
  if (!turnstileEnabled.value || !container || typeof window === 'undefined') return
  await loadTurnstileScript()
  const turnstile = (window as any).turnstile
  if (!turnstile || !turnstileSiteKey.value) return
  return turnstile.render(container, {
    sitekey: turnstileSiteKey.value,
    theme: colorMode.value === 'dark' ? 'dark' : 'light',
  })
}

async function resetTurnstile() {
  if (typeof window === 'undefined') return
  const turnstile = (window as any).turnstile
  if (!turnstile) return
  if (turnstileWidgetId) turnstile.reset(turnstileWidgetId)
  if (turnstileWidgetIdUpdate) turnstile.reset(turnstileWidgetIdUpdate)
}

function getTurnstileToken(): string {
  if (typeof window === 'undefined') return ''
  const turnstile = (window as any).turnstile
  if (!turnstile) return ''
  const id = mode.value === 'apply' ? turnstileWidgetId : turnstileWidgetIdUpdate
  return id ? turnstile.getResponse(id) || '' : ''
}

watch(() => mode.value, async () => {
  error.value = null
  await nextTick()
  if (mode.value === 'apply' && turnstileEl.value && !turnstileWidgetId) {
    turnstileWidgetId = await renderTurnstile(turnstileEl.value)
  }
  if (mode.value === 'update' && turnstileElUpdate.value && !turnstileWidgetIdUpdate) {
    turnstileWidgetIdUpdate = await renderTurnstile(turnstileElUpdate.value)
  }
})

watch(() => colorMode.value, async () => {
  await resetTurnstile()
  turnstileWidgetId = null
  turnstileWidgetIdUpdate = null
  await nextTick()
  turnstileWidgetId = await renderTurnstile(turnstileEl.value)
  turnstileWidgetIdUpdate = await renderTurnstile(turnstileElUpdate.value)
})

function normalizeURL(url: string) {
  return url.replace(/\/$/, '').trim()
}

function validateForm(form: ApplyForm | UpdateForm): string | null {
  if (!form.name.trim()) return '请输入站点名称'
  const link = normalizeURL(form.link)
  if (!link) return '请输入站点地址'
  if (!/^https?:\/\//i.test(link)) return '站点地址必须以 http:// 或 https:// 开头'
  if (!form.avatar.trim()) return '请输入头像地址'
  const email = form.email?.trim() || ''
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '请输入有效的邮箱地址'
  if ('original_url' in form) {
    const original = normalizeURL(form.original_url)
    if (!original) return '请输入原站点地址'
    if (!/^https?:\/\//i.test(original)) return '原站点地址必须以 http:// 或 https:// 开头'
  }
  return null
}

async function submitApply() {
  if (submitting.value) return
  const validationError = validateForm(applyForm.value)
  if (validationError) {
    error.value = validationError
    return
  }
  await submit('apply')
}

async function submitUpdate() {
  if (submitting.value) return
  const validationError = validateForm(updateForm.value)
  if (validationError) {
    error.value = validationError
    return
  }
  await submit('update')
}

async function submit(type: 'apply' | 'update') {
  submitting.value = true
  error.value = null
  success.value = null

  try {
    const turnstileToken = getTurnstileToken()
    if (turnstileEnabled.value && !turnstileToken) {
      error.value = '请完成人机验证'
      return
    }

    if (type === 'apply') {
      const { name, link, avatar, description, email, snapshot, friend_link_page, feed, enable_rss } = applyForm.value
      const message = await api.applyFriendLink({
        name: name.trim(),
        link: normalizeURL(link),
        avatar: avatar.trim(),
        description: description.trim(),
        email: email.trim(),
        snapshot: snapshot.trim(),
        friend_link_page: friend_link_page.trim(),
        feed: feed.trim(),
        enable_rss,
        turnstile_token: turnstileToken,
      })
      success.value = message
    } else {
      const { original_url, name, link, avatar, description, email, snapshot, friend_link_page, feed, enable_rss } = updateForm.value
      const message = await api.updateApplyFriendLink({
        original_url: normalizeURL(original_url),
        name: name.trim(),
        link: normalizeURL(link),
        avatar: avatar.trim(),
        description: description.trim(),
        email: email.trim(),
        snapshot: snapshot.trim(),
        friend_link_page: friend_link_page.trim(),
        feed: feed.trim(),
        enable_rss,
        turnstile_token: turnstileToken,
      })
      success.value = message
    }

    resetForm()
    await loadSubmissions(1)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '提交失败，请稍后重试'
  } finally {
    submitting.value = false
    await resetTurnstile()
  }
}

function resetForm() {
  applyForm.value = {
    name: '', link: '', avatar: '', description: '', email: '',
    snapshot: '', friend_link_page: '', feed: '', enable_rss: false,
  }
  updateForm.value = {
    original_url: '', name: '', link: '', avatar: '', description: '', email: '',
    snapshot: '', friend_link_page: '', feed: '', enable_rss: false,
  }
}

function resetAll() {
  resetForm()
  success.value = null
  error.value = null
}

async function loadSubmissions(page = 1) {
  if (submissionsLoading.value) return
  submissionsLoading.value = true
  submissionsError.value = null
  try {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(submissionsPageSize.value),
    })
    if (statusFilter.value) params.set('status', statusFilter.value)
    if (searchKeyword.value.trim()) params.set('search', searchKeyword.value.trim())

    const data = await api.getFriendSubmissions(params.toString())
    submissions.value = data.submissions || []
    submissionsTotal.value = data.total || 0
    submissionsPage.value = page
  } catch (cause) {
    submissionsError.value = cause instanceof Error ? cause.message : '加载申请列表失败'
  } finally {
    submissionsLoading.value = false
  }
}

function debounceSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadSubmissions(1), 300)
}

onMounted(async () => {
  await loadVerifyConfig()
  if (turnstileEnabled.value) {
    await nextTick()
    turnstileWidgetId = await renderTurnstile(turnstileEl.value)
  }
  await loadSubmissions(1)
})
</script>

<style scoped>
.friend-apply-section {
  margin-top: 32px;
}

.apply-title {
  margin: 0 0 6px;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
}

.apply-desc {
  margin: 0 0 16px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.conditions-card,
.apply-card,
.submissions-card,
.success-card {
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  margin-bottom: 16px;
}

.conditions-title,
.submissions-title {
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.conditions-sub {
  margin: 0 0 12px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.condition-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  font-size: 0.85rem;
  color: var(--text);
  cursor: pointer;
}

.condition-checkbox {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: var(--accent);
  cursor: pointer;
  flex-shrink: 0;
}

.condition-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 0.8rem;
}

.condition-hint.hidden {
  display: none;
}

.mode-switch {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.mode-btn {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface-muted);
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.mode-btn.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.apply-form {
  display: grid;
  gap: 14px;
}

.form-field {
  display: grid;
  gap: 4px;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text);
}

.required {
  color: #ef4444;
}

.field-input {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface-muted);
  color: var(--text);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field-input::placeholder {
  color: var(--text-muted);
}

.field-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.field-hint {
  margin: 0;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.toggle-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text);
  cursor: pointer;
}

.toggle-field input {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  cursor: pointer;
}

.turnstile-widget {
  min-height: 65px;
}

.form-error {
  padding: 10px 12px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 0.85rem;
}

.submit-btn {
  width: 100%;
  padding: 11px 16px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s ease;
}

.submit-btn:hover {
  filter: brightness(1.08);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.update-divider {
  border-top: 1px solid var(--line);
  padding-top: 14px;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.update-divider p {
  margin: 0;
}

.success-card {
  text-align: center;
  padding: 40px 24px;
}

.success-icon {
  display: block;
  margin: 0 auto 14px;
  font-size: 2.4rem;
  color: #22c55e;
}

.success-card h3 {
  margin: 0 0 6px;
  font-size: 1rem;
  color: var(--text);
}

.success-card p {
  margin: 0 0 14px;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.submissions-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}

.submissions-count {
  margin-left: 4px;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-muted);
}

.submissions-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
  min-width: 0;
}

.filter-select,
.search-input {
  padding: 6px 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface-muted);
  color: var(--text);
  font-size: 0.8rem;
  outline: none;
}

.filter-select {
  cursor: pointer;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 180px;
}

.search-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding-left: 26px;
}

.submissions-empty,
.submissions-error {
  padding: 32px 16px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.submissions-error {
  color: #ef4444;
}

.submissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.submission-item {
  padding: 12px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  background: var(--surface-muted);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.submission-item:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.submission-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.submission-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.submission-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

.submission-badge.pending {
  background: rgba(245, 166, 35, 0.15);
  color: #d97706;
}

.submission-badge.approved,
.submission-badge.survival {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.submission-badge.rejected {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.submission-badge.timeout {
  background: rgba(245, 166, 35, 0.15);
  color: #d97706;
}

.submission-badge.error {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}

.dark .submission-badge.pending {
  color: #fbbf24;
}

.dark .submission-badge.approved,
.dark .submission-badge.survival {
  color: #4ade80;
}

.dark .submission-badge.rejected {
  color: #f87171;
}

.dark .submission-badge.timeout {
  color: #fbbf24;
}

.dark .submission-badge.error {
  color: #fca5a5;
}

.submission-desc {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.submissions-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface-muted);
  color: var(--text);
  cursor: pointer;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.text-button {
  border: 0;
  background: transparent;
  color: var(--accent);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

@media (max-width: 640px) {
  .friend-apply-section {
    margin-top: 24px;
  }

  .submissions-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .submissions-controls {
    width: 100%;
    justify-content: flex-start;
  }

  .search-wrap {
    max-width: none;
  }

  .submissions-grid {
    grid-template-columns: 1fr;
  }
}
</style>