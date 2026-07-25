import { jikeConfig } from './config'

declare const process: {
  env: Record<string, string | undefined>
}

console.log('[build] Gitalk env vars present:', {
  clientId: !!process.env.NUXT_PUBLIC_GITALK_CLIENT_ID,
  clientSecret: !!process.env.NUXT_PUBLIC_GITALK_CLIENT_SECRET,
  repo: process.env.NUXT_PUBLIC_GITALK_REPO || jikeConfig.gitalk.repo,
  owner: process.env.NUXT_PUBLIC_GITALK_OWNER || jikeConfig.gitalk.owner,
  admin: process.env.NUXT_PUBLIC_GITALK_ADMIN || jikeConfig.gitalk.admin.join(','),
})

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: 'app/',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@nuxt/icon', '@nuxtjs/color-mode', '@vueuse/nuxt'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || jikeConfig.api.baseURL,
      gitalkClientId: process.env.NUXT_PUBLIC_GITALK_CLIENT_ID || '',
      gitalkClientSecret: process.env.NUXT_PUBLIC_GITALK_CLIENT_SECRET || '',
      gitalkRepo: process.env.NUXT_PUBLIC_GITALK_REPO || jikeConfig.gitalk.repo,
      gitalkOwner: process.env.NUXT_PUBLIC_GITALK_OWNER || jikeConfig.gitalk.owner,
      gitalkAdmin: process.env.NUXT_PUBLIC_GITALK_ADMIN || jikeConfig.gitalk.admin.join(','),
      gitalkProxy: process.env.NUXT_PUBLIC_GITALK_PROXY || jikeConfig.gitalk.proxy || '',
      gitalkUseProxy: !!process.env.NUXT_PUBLIC_GITALK_GH_TOKEN,
    },
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  css: ['~/assets/styles/theme.scss', '~/assets/styles/simple-markdown.scss'],
  nitro: {
    preset: 'static',
  },
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#f5f4ef' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: '/css/APlayer.min.css' },
        { rel: 'stylesheet', href: '/css/gitalk.css' },
      ],
      script: [
        { src: '/js/APlayer.min.js', async: true, defer: true },
        { src: '/js/Meting.min.js', async: true, defer: true },
      ],
    },
  },
})
