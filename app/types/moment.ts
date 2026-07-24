import type { JikeReaction } from '../../config'

export interface MomentMedia {
  id: number
  name: string
  url: string
  type: string
  isVideo: boolean
}

export type MetingMusicServer = 'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
export type MetingMusicType = 'song' | 'playlist' | 'album' | 'search' | 'artist'

export interface MetingMusic {
  id: string
  server: MetingMusicServer
  type: MetingMusicType
  api?: string
}

export interface ExternalMusic {
  url: string
  cover?: string
  title?: string
  artist?: string
  lrc?: string
  lrcUrl?: string
}

export type MusicExtension = MetingMusic | ExternalMusic

export interface LegacyMomentExtension {
  music?: MusicExtension
  doubanBook?: unknown
  doubanMovie?: unknown
  video?: unknown
}

export type ApiExtensionType = 'github' | 'website' | 'location' | 'music' | 'tweet'

export interface GithubExtensionPayload {
  repo_url: string
}

export interface WebsiteExtensionPayload {
  title: string
  site: string
}

export interface LocationExtensionPayload {
  placeholder: string
  latitude: number
  longitude: number
}

export interface ApiMusicExtensionPayload {
  url: string
}

export interface TweetExtensionPayload {
  url: string
  username: string
  status_id: string
}

export interface GithubApiExtension {
  type: 'github'
  payload: GithubExtensionPayload
}

export interface WebsiteApiExtension {
  type: 'website'
  payload: WebsiteExtensionPayload
}

export interface LocationApiExtension {
  type: 'location'
  payload: LocationExtensionPayload
}

export interface MusicApiExtension {
  type: 'music'
  payload: ApiMusicExtensionPayload
}

export interface TweetApiExtension {
  type: 'tweet'
  payload: TweetExtensionPayload
}

export type ApiMomentExtension =
  | GithubApiExtension
  | WebsiteApiExtension
  | LocationApiExtension
  | MusicApiExtension
  | TweetApiExtension

export type MomentExtension = LegacyMomentExtension | ApiMomentExtension

export function parseApiExtension(value: unknown): ApiMomentExtension | null {
  if (!value || typeof value !== 'object') return null
  const ext = value as { type?: string; payload?: Record<string, unknown> }
  if (!ext.type || !ext.payload || typeof ext.payload !== 'object') return null
  switch (ext.type) {
    case 'github': {
      if (typeof ext.payload.repo_url !== 'string') return null
      const payload: GithubExtensionPayload = { repo_url: ext.payload.repo_url }
      return { type: 'github', payload }
    }
    case 'website': {
      if (typeof ext.payload.title !== 'string' || typeof ext.payload.site !== 'string') return null
      const payload: WebsiteExtensionPayload = { title: ext.payload.title, site: ext.payload.site }
      return { type: 'website', payload }
    }
    case 'location': {
      if (
        typeof ext.payload.placeholder !== 'string' ||
        typeof ext.payload.latitude !== 'number' ||
        typeof ext.payload.longitude !== 'number'
      )
        return null
      const payload: LocationExtensionPayload = {
        placeholder: ext.payload.placeholder,
        latitude: ext.payload.latitude,
        longitude: ext.payload.longitude,
      }
      return { type: 'location', payload }
    }
    case 'music': {
      if (typeof ext.payload.url !== 'string') return null
      const payload: ApiMusicExtensionPayload = { url: ext.payload.url }
      return { type: 'music', payload }
    }
    case 'tweet': {
      if (
        typeof ext.payload.url !== 'string' ||
        typeof ext.payload.username !== 'string' ||
        typeof ext.payload.status_id !== 'string'
      )
        return null
      const payload: TweetExtensionPayload = {
        url: ext.payload.url,
        username: ext.payload.username,
        status_id: ext.payload.status_id,
      }
      return { type: 'tweet', payload }
    }
    default:
      return null
  }
}

export interface Moment {
  id: number
  content: string
  status: string
  tags: string[]
  pinnedOrder: number
  isAd: boolean
  extension: MomentExtension | null
  messageLink: string
  createdAt: number
  updatedAt: number
  media: MomentMedia[]
  reactions: Record<string, number>
  selectedReaction: JikeReaction | null
}

export interface MomentsPage {
  items: Moment[]
  total: number
  page: number
  pageSize: number
}
