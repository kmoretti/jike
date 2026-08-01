import type { Moment, MomentsPage } from '../types/moment'
import { jikeConfig } from '../../config'

const MOMENTS_CACHE_KEY = 'moments:first-page'
const MOMENTS_CACHE_TTL = 5 * 60 * 1000 // 5 分钟

export function useJikeMoments() {
  const api = useJikeApi()
  const { fingerprintToken } = useFingerprint()
  const moments = useState<Moment[]>('jike-moments', () => [])
  const total = useState('jike-moments-total', () => 0)
  const page = useState('jike-moments-page', () => 1)
  const pageSize = jikeConfig.api.pageSize
  const loading = useState('jike-moments-loading', () => false)
  const refreshing = useState('jike-moments-refreshing', () => false)
  const error = useState<string | null>('jike-moments-error', () => null)
  const hasLoaded = useState('jike-moments-loaded', () => false)

  async function load(targetPage = 1, append = false) {
    if (loading.value) return

    // 首屏优先读取缓存，避免每次进入都请求 API
    if (targetPage === 1 && !append) {
      const cached = getCachedData<MomentsPage>(MOMENTS_CACHE_KEY, MOMENTS_CACHE_TTL)
      if (cached) {
        applyPage(cached, false)
        hasLoaded.value = true
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const result = await api.getMoments(targetPage, pageSize, fingerprintToken.value)
      applyPage(result, append)
      hasLoaded.value = true
      if (targetPage === 1 && !append) {
        setCachedData(MOMENTS_CACHE_KEY, result)
      }
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : '动态加载失败，请稍后重试'
    } finally {
      loading.value = false
      refreshing.value = false
    }
  }

  async function refresh() {
    if (refreshing.value) return
    refreshing.value = true
    clearCachedData(MOMENTS_CACHE_KEY)
    await load(1, false)
  }

  async function loadMore() {
    if (loading.value || moments.value.length >= total.value) return
    await load(page.value + 1, true)
  }

  async function probe() {
    if (loading.value || refreshing.value || !hasLoaded.value) return false
    try {
      const latest = await api.getMoments(1, jikeConfig.api.probePageSize, fingerprintToken.value)
      const current = moments.value[0]
      const incoming = latest.items[0]
      if (!current || !incoming) return false
      const changed = current.id !== incoming.id || current.updatedAt !== incoming.updatedAt
      if (changed) await refresh()
      return changed
    } catch {
      return false
    }
  }

  function applyPage(result: MomentsPage, append: boolean) {
    page.value = result.page
    total.value = result.total
    moments.value = append ? [...moments.value, ...result.items] : result.items
  }

  return {
    moments,
    total,
    page,
    pageSize,
    loading,
    refreshing,
    error,
    hasLoaded,
    load,
    refresh,
    loadMore,
    probe,
  }
}
