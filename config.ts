export interface JikeNavItem {
  label: string
  icon: string
  to?: string
  href?: string
}

const adminURL = 'https://blog-api.2005815.xyz/panel'
const adminEmbed = true

export const jikeConfig = {
  site: {
    name: '朋友圈',
    description: '一个安静的公开动态时间线。',
    profile: {
      nickname: '克喵Moretti',
      avatar: 'https://q2.qlogo.cn/headimg_dl?dst_uin=3149261770&spec=0',
      cover: 'https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/bg.webp',
      signature: '人生如逆旅，我亦是行人。',
    },
    adminURL,
    adminEmbed,
  },
  api: {
    baseURL: 'https://blog-api.2005815.xyz',
    pageSize: 10,
    probePageSize: 1,
  },
  pagination: {
    friends: 12,
    rss: 20,
  },
  nav: [
    { label: '友链', icon: 'lucide:link', to: '/friends' },
    { label: 'RSS', icon: 'lucide:rss', to: '/rss' },
    ...(adminEmbed
      ? [{ label: '后台', icon: 'lucide:settings', to: '/admin' } as const]
      : [{ label: '后台', icon: 'lucide:settings', href: adminURL } as const]),
  ] satisfies JikeNavItem[],
  refresh: {
    enabled: true,
    interval: 30_000,
    pauseWhenHidden: true,
  },
  theme: {
    defaultMode: 'system' as const,
    enableDarkMode: true,
  },
  reactions: ['👍', '👎', '❤', '👀', '💩'] as const,
  music: {
    metingApi: 'https://meting.081531.xyz/api',
  },
} as const

export type JikeReaction = (typeof jikeConfig.reactions)[number]
