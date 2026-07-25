export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      })
    }

    // Proxy GitHub API requests with GH_TOKEN to avoid rate limits
    if (url.pathname.startsWith('/api/github/')) {
      const targetPath = url.pathname.slice('/api/github/'.length)
      const targetUrl = `https://api.github.com/${targetPath}${url.search}`

      const headers = new Headers(request.headers)
      headers.delete('host')
      headers.delete('origin')
      headers.delete('referer')

      const ghToken = __GH_TOKEN__
      if (ghToken) {
        headers.set('Authorization', `token ${ghToken}`)
      }

      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: request.body,
      })

      const corsHeaders = new Headers(response.headers)
      corsHeaders.set('Access-Control-Allow-Origin', '*')
      corsHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      corsHeaders.set('Access-Control-Allow-Headers', '*')

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: corsHeaders,
      })
    }

    // Proxy GitHub OAuth token exchange
    if (url.pathname === '/api/github-oauth') {
      const headers = new Headers(request.headers)
      headers.delete('host')
      headers.delete('origin')
      headers.delete('referer')

      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: request.method,
        headers,
        body: request.body,
      })

      const corsHeaders = new Headers(response.headers)
      corsHeaders.set('Access-Control-Allow-Origin', '*')

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: corsHeaders,
      })
    }

    return env.ASSETS.fetch(request)
  },
}
