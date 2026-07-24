import { jikeConfig } from '../../config'

const fingerprintStorageKey = 'jike-fingerprint-token'
const antibotStorageKey = 'jike-antibot-token'
const antibotExpiryStorageKey = 'jike-antibot-expiry'

export function useFingerprint() {
  const api = useJikeApi()
  const fingerprintToken = useState<string>('jike-fingerprint-token', () => '')
  const antiBotToken = useState<string>('jike-antibot-token', () => '')
  const initialized = useState('jike-fingerprint-initialized', () => false)
  const initializing = useState('jike-fingerprint-initializing', () => false)
  const turnstileEnabled = useState('jike-turnstile-enabled', () => false)
  const verifyConfigLoaded = useState('jike-verify-config-loaded', () => false)

  async function loadVerifyConfig() {
    if (verifyConfigLoaded.value || !import.meta.client) return turnstileEnabled.value
    const response = await api.getVerifyConfig()
    turnstileEnabled.value = response.turnstile.enable
    verifyConfigLoaded.value = true
    return turnstileEnabled.value
  }

  async function init() {
    if (initialized.value || initializing.value || !import.meta.client) return fingerprintToken.value
    initializing.value = true

    try {
      fingerprintToken.value = localStorage.getItem(fingerprintStorageKey) || ''
      antiBotToken.value = localStorage.getItem(antibotStorageKey) || ''

      if (await loadVerifyConfig()) {
        throw new Error('当前 API 已启用人机验证，暂不支持表情操作')
      }

      const token = await ensureAntiBotToken()
      const response = await api.createFingerprint(token, fingerprintToken.value)
      fingerprintToken.value = response.fingerprint_token
      localStorage.setItem(fingerprintStorageKey, fingerprintToken.value)
      initialized.value = true
      return fingerprintToken.value
    } catch (error) {
      antiBotToken.value = ''
      throw error
    } finally {
      initializing.value = false
    }
  }

  async function ensureAntiBotToken() {
    if (!import.meta.client) return ''
    if (await loadVerifyConfig()) throw new Error('当前 API 已启用人机验证，暂不支持表情操作')
    const expiry = Number(localStorage.getItem(antibotExpiryStorageKey) || 0)
    if (antiBotToken.value && expiry > Date.now()) return antiBotToken.value
    const response = await api.issueAntiBotToken()
    antiBotToken.value = response.antibot_token
    localStorage.setItem(antibotStorageKey, antiBotToken.value)
    localStorage.setItem(antibotExpiryStorageKey, String(Date.now() + response.expires_in * 1000))
    return antiBotToken.value
  }

  return {
    fingerprintToken,
    antiBotToken,
    initialized,
    initializing,
    init,
    ensureAntiBotToken,
    storageKey: jikeConfig.site.name,
  }
}
