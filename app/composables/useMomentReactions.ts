import type { JikeReaction } from '../../config'
import type { Moment } from '../types/moment'

export function useMomentReactions() {
  const api = useJikeApi()
  const { fingerprintToken, antiBotToken, init, ensureAntiBotToken } = useFingerprint()
  const pending = useState<Record<number, boolean>>('jike-reaction-pending', () => ({}))
  const errors = useState<Record<number, string | null>>('jike-reaction-errors', () => ({}))

  async function toggle(moment: Moment, reaction: JikeReaction) {
    if (pending.value[moment.id]) return
    pending.value = { ...pending.value, [moment.id]: true }
    errors.value = { ...errors.value, [moment.id]: null }

    const previousSelected = moment.selectedReaction
    const previousCounts = { ...moment.reactions }
    const removing = previousSelected === reaction
    const nextSelected = removing ? null : reaction

    if (previousSelected) moment.reactions[previousSelected] = Math.max(0, (moment.reactions[previousSelected] || 0) - 1)
    if (!removing) moment.reactions[reaction] = (moment.reactions[reaction] || 0) + 1
    moment.selectedReaction = nextSelected

    try {
      await init()
      const antiBot = await ensureAntiBotToken()
      if (!fingerprintToken.value) throw new Error('访客身份初始化失败，请稍后重试')
      if (removing) {
        await api.changeReaction(moment.id, reaction, fingerprintToken.value, antiBot, 'DELETE')
      } else {
        if (previousSelected) {
          await api.changeReaction(moment.id, previousSelected, fingerprintToken.value, antiBot, 'DELETE')
        }
        await api.changeReaction(moment.id, reaction, fingerprintToken.value, antiBot, 'POST')
      }
    } catch (cause) {
      moment.selectedReaction = previousSelected
      moment.reactions = previousCounts
      errors.value = { ...errors.value, [moment.id]: cause instanceof Error ? cause.message : '反应提交失败' }
    } finally {
      const nextPending = { ...pending.value }
      delete nextPending[moment.id]
      pending.value = nextPending
    }
  }

  function isPending(momentId: number) {
    return Boolean(pending.value[momentId])
  }

  return { toggle, isPending, errors }
}
