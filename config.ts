export interface JikeNavItem {
  label: string
  icon: string
  to?: string
  href?: string
}

export interface GitalkConfig {
  repo: string
  owner: string
  admin: string[]
  labels: string[]
  language: string
  perPage: number
  pagerDirection: 'last' | 'first'
  createIssueManually: boolean
  distractionFreeMode: boolean
  proxy?: string
}

const adminURL = 'https://blog-api.2005815.xyz/panel'
const adminEmbed = true
const apiBaseURL = 'https://blog-api.2005815.xyz'
const momentFeedURL = `${apiBaseURL}/api/public/moments/feed`

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
    rss: momentFeedURL,
  },
  api: {
    baseURL: apiBaseURL,
    pageSize: 10,
    probePageSize: 1,
  },
  pagination: {
    friends: 12,
    rss: 20,
  },
  friendLink: {
    // 友链申请表单中「我已添加 xxx 的友情链接」里显示的站点名
    // 留空则使用 site.name
    applyConditionSiteName: '喵洛阁',
    // 展示在友链页面的「本站信息」卡片，方便他站复制
    mySite: {
      name: '喵洛阁',
      link: 'https://im.081531.xyz/',
      avatar: 'https://q2.qlogo.cn/headimg_dl?dst_uin=3149261770&spec=0',
      descr: '人生如逆旅，我亦是行人。',
      siteshot: 'https://up.sc.cn/link/2Hy4vjnw',
      atom: momentFeedURL,
    },
  },
  nav: [
    { label: '友链', icon: 'lucide:link', to: '/friends' },
    { label: 'RSS', icon: 'lucide:rss', to: '/rss' },
    { label: '动态', icon: 'lucide:activity', href: momentFeedURL },
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
  gitalk: {
    repo: 'jike',
    owner: 'kmoretti',
    admin: ['kmoretti'],
    labels: ['gitalk', 'jike'],
    language: 'zh-CN',
    perPage: 10,
    pagerDirection: 'last',
    createIssueManually: false,
    distractionFreeMode: false,
    proxy: 'https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token',
  } satisfies GitalkConfig,
} as const

export type JikeReaction = (typeof jikeConfig.reactions)[number]
