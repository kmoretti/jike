import type { AntiBotResponse, ApiFriendLink, ApiMoment, ApiRssPost, ApiResponse, FingerprintResponse, FriendLinkApplyReq, FriendLinkSubmission, FriendSubmissionsResponse, FriendLinkUpdateApplyReq, PaginatedResponse, VerifyConfigResponse } from '../types/api'
import type { Moment, MomentExtension, MomentsPage } from '../types/moment'
import type { JikeReaction } from '../../config'
import { jikeConfig } from '../../config'

export class JikeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: number,
  ) {
    super(message)
    this.name = 'JikeApiError'
  }
}

export function useJikeApi() {
  const runtimeConfig = useRuntimeConfig()
  const baseURL = String(runtimeConfig.public.apiBase || jikeConfig.api.baseURL).replace(/\/$/, '')

  async function request<T>(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    let response: Response
    try {
      response = await fetch(`${baseURL}${path}`, {
        ...options,
        headers,
        cache: 'no-store',
      })
    } catch {
      throw new JikeApiError('网络连接失败，请稍后重试', 0)
    }

    let payload: ApiResponse<T> | null = null
    try {
      payload = await response.json() as ApiResponse<T>
    } catch {
      throw new JikeApiError('API 返回了无法识别的数据', response.status)
    }

    if (!response.ok || payload.code >= 400) {
      throw new JikeApiError(payload.message || '请求失败', response.status, payload.code)
    }

    return payload.data
  }

  async function getVerifyConfig() {
    return request<VerifyConfigResponse>('/api/public/verify_conf')
  }

  async function getMoments(page = 1, pageSize: number = jikeConfig.api.pageSize, fingerprintToken = ''): Promise<MomentsPage> {
    const headers = fingerprintToken ? { 'X-Fingerprint-Token': fingerprintToken } : undefined
    const data = await request<PaginatedResponse<ApiMoment>>(
      `/api/public/moments/?page=${page}&page_size=${pageSize}`,
      { headers },
    )

    return {
      items: data.items.map(normalizeMoment),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
    }
  }

  async function issueAntiBotToken(turnstileToken = '') {
    return request<AntiBotResponse>('/api/verify/turnstile', {
      method: 'POST',
      body: JSON.stringify(turnstileToken ? { turnstile_token: turnstileToken } : {}),
    })
  }

  async function createFingerprint(antiBotToken: string, fingerprintToken = '') {
    return request<FingerprintResponse>('/api/verify/fingerprint', {
      method: 'POST',
      headers: {
        ...(fingerprintToken ? { 'X-Fingerprint-Token': fingerprintToken } : {}),
        'X-Antibot-Token': antiBotToken,
      },
      body: JSON.stringify({}),
    })
  }

  async function changeReaction(momentId: number, reaction: JikeReaction, fingerprintToken: string, antiBotToken: string, method: 'POST' | 'DELETE') {
    return request<null>(`/api/public/moments/${momentId}/reactions`, {
      method,
      headers: {
        'X-Fingerprint-Token': fingerprintToken,
        'X-Antibot-Token': antiBotToken,
      },
      body: JSON.stringify({ reaction }),
    })
  }

  async function getFriendLinks(page = 1, pageSize = 100) {
    return request<PaginatedResponse<ApiFriendLink>>(
      `/api/public/friend/?page=${page}&page_size=${pageSize}`,
    )
  }

  async function applyFriendLink(body: FriendLinkApplyReq): Promise<string> {
    const data = await request<{ id: number; status: string; message: string }>('/api/public/friend/apply', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return data.message || '友链申请已提交'
  }

  async function updateApplyFriendLink(body: FriendLinkUpdateApplyReq): Promise<string> {
    const data = await request<{ id: number; original_id: number; status: string; message: string }>('/api/public/friend/update-apply', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return data.message || '友链更新申请已提交'
  }

  async function getFriendSubmissions(query = ''): Promise<FriendSubmissionsResponse> {
    return request<FriendSubmissionsResponse>(`/api/public/friend/submissions${query ? `?${query}` : ''}`)
  }

  async function getRssPosts(page = 1, pageSize = 20, friendLinkID?: number) {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (friendLinkID) params.set('friend_link_id', String(friendLinkID))
    return request<PaginatedResponse<ApiRssPost>>(`/api/public/rss/?${params.toString()}`)
  }

  async function refreshRssPosts() {
    return request<{ message: string; feed_count: number }>('/api/public/rss/refresh', { method: 'POST' })
  }

  return {
    baseURL,
    getVerifyConfig,
    getMoments,
    getFriendLinks,
    applyFriendLink,
    updateApplyFriendLink,
    getFriendSubmissions,
    getRssPosts,
    refreshRssPosts,
    issueAntiBotToken,
    createFingerprint,
    changeReaction,
  }
}

function normalizeMoment(item: ApiMoment): Moment {
  const tags = item.tags
    ? item.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    : []

  let extension: MomentExtension | null = null
  if (item.extension) {
    try {
      const parsed = JSON.parse(item.extension)
      if (parsed && typeof parsed === 'object') extension = parsed as MomentExtension
    } catch {
      extension = null
    }
  }

  return {
    id: item.id,
    content: item.content || '',
    status: item.status,
    tags,
    pinnedOrder: item.pinned_order,
    isAd: item.is_ad === 1,
    extension,
    messageLink: item.message_link || '',
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    media: item.media.filter(media => media.is_deleted !== 1).map(media => ({
      id: media.id,
      name: media.name || '',
      url: media.media_url,
      type: media.media_type,
      isVideo: media.media_type.startsWith('video/') || media.media_type === 'video',
    })),
    reactions: { ...(item.reactions || {}) },
    selectedReaction: (item.selected_reaction || null) as Moment['selectedReaction'],
  }
}
