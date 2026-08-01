export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface ApiMomentMedia {
  id: number
  moment_id: number
  name?: string
  media_url: string
  media_type: string
  is_local: number
  is_deleted: number
}

export interface ApiMoment {
  id: number
  content: string
  status: string
  tags: string
  pinned_order: number
  is_ad: number
  extension?: string
  message_link?: string
  created_at: number
  updated_at: number
  media: ApiMomentMedia[]
  reactions: Record<string, number>
  selected_reaction?: string
}

export interface FingerprintResponse {
  fingerprint_token: string
}

export interface AntiBotResponse {
  antibot_token: string
  expires_at: number
  expires_in: number
}

export interface VerifyConfigResponse {
  turnstile: {
    enable: boolean
    site_key?: string
  }
}

export interface ApiFriendLink {
  id: number
  name: string
  link: string
  avatar: string
  description: string
  status: string
  enable_rss: boolean
  friend_link_page?: string
  feed?: string
  snapshot?: string
}

export interface FriendLinkApplyReq {
  name: string
  link: string
  avatar: string
  description?: string
  email?: string
  snapshot?: string
  friend_link_page?: string
  feed?: string
  enable_rss: boolean
  turnstile_token?: string
}

export interface FriendLinkUpdateApplyReq {
  original_url: string
  name: string
  link: string
  avatar: string
  description?: string
  email?: string
  snapshot?: string
  friend_link_page?: string
  feed?: string
  enable_rss: boolean
  turnstile_token?: string
}

export interface FriendLinkSubmission {
  id: number
  name: string
  description?: string
  status: string
  updated_at: number
}

export interface FriendSubmissionsResponse {
  submissions: FriendLinkSubmission[]
  total: number
  page: number
  page_size: number
}

export interface ApiRssPost {
  id: number
  rss_id: number
  title: string
  link: string
  description: string
  author: string
  time: number
}

export interface ApiFriendJSONLink {
  name: string
  blog?: string
  url: string
  avatar: string
  desc?: string
  color?: string
  siteshot?: string
  rss?: string
  tags?: string[]
}

export interface ApiFriendGroup {
  name: string
  desc?: string
  links: ApiFriendJSONLink[]
}

export interface ApiFriendJSON {
  linkGroups: ApiFriendGroup[]
}
