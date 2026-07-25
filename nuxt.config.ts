export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: 'app/',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@nuxt/icon', '@nuxtjs/color-mode', '@vueuse/nuxt'],
  runtimeConfig: {
    public: {
      apiBase: '',
      gitalkClientID: '',
      gitalkClientSecret: '',
      gitalkRepo: '',
      gitalkOwner: '',
      gitalkAdmin: '',
      gitalkProxy: '',
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
