import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { Euler, MathUtils, Quaternion, type Group } from 'three'
import { Envelope, type MailPlace } from '../../scene/Envelope'
import { ALIAS } from '../../scene/envelopeFace'
import { Ring } from '../../scene/Ring'
import { MAIL, mailPhase, smoothstep, type MailPhase } from '../../scene/scrollState'

export { ALIAS, MAIL, mailPhase, type MailPhase, type MailPlace }

export const STEPS: { phase: MailPhase; label: string }[] = [
  { phase: 'incoming', label: 'Sent to your alias' },
  { phase: 'received', label: `+${MAIL.amount.toFixed(2)} USDC on your ring` },
  { phase: 'burned', label: 'Alias burned' },
]
const ORDER: MailPhase[] = ['incoming', 'opened', 'received', 'burned']
/** Whether the story has reached `s` at phase `now`. */
export const reached = (now: MailPhase, s: MailPhase) => ORDER.indexOf(now) >= ORDER.indexOf(s)
/** 0 → 1 while the coins land in the ring (a little pulse). */
export const landing = (p: number) => {
  const end = MAIL.coins[1]
  return smoothstep(end - 0.14, end - 0.04, p) * (1 - smoothstep(end + 0.02, end + 0.12, p))
}

// standing upright, hole facing us, to catch the coins
const UPRIGHT = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0))
const sway = new Quaternion()
const e = new Euler()

/** The 3D envelope (arrives, opens, sends its coins, burns the alias) and the ring that catches the coins. */
export function MailRig({ progress, place, ringScale }: { progress: RefObject<number>; place: RefObject<MailPlace>; ringScale: number }) {
  const ring = useRef<Group>(null)
  useFrame((state, dt) => {
    const g = ring.current
    if (!g) return
    const t = state.clock.elapsedTime
    g.position.lerp(place.current.ring, 1 - Math.exp(-dt * 8))
    g.position.y += Math.sin(t * 1.2) * 0.0015
    sway.setFromEuler(e.set(0, Math.sin(t * 0.7) * 0.2, 0))
    g.quaternion.copy(sway).multiply(UPRIGHT)
    g.scale.setScalar(MathUtils.damp(g.scale.x || ringScale, ringScale * (1 + landing(progress.current) * 0.12), 10, dt))
  })
  return (
    <>
      <Envelope progress={progress} place={place} />
      <group ref={ring}>
        <Ring />
      </group>
    </>
  )
}
