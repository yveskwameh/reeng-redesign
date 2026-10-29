import { useFrame } from '@react-three/fiber'
import { useRef, useState, type RefObject } from 'react'
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three'
import { modes, type Mode } from '../../content/ecosystem'
import { Ring } from '../../scene/Ring'
import { ECO_MODES, ecoMode } from '../../scene/scrollState'
import { useSectionProgress } from '../tap-to-pay/shared'

export { modes, ECO_MODES, type Mode }
export * from '../../components/ecosystem'

/** Section progress, the mode it's in, and how far through that mode (0–1). */
export function useEco(section: RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0)
  const live = useRef(0)
  useSectionProgress(section, (v) => {
    live.current = v
    setP(v)
  })
  const mode = ecoMode(p)
  return { p, live, mode, local: MathUtils.clamp(p * ECO_MODES - mode, 0, 1) }
}

/** The tap in each mode: the ring dips in and back out early in its segment. */
export const tapOf = (local: number) => Math.sin(Math.PI * MathUtils.clamp((local - 0.12) / 0.3, 0, 1))

const HERO = new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35))
const spinQ = new Quaternion()
const Y = new Vector3(0, 1, 0)
const to = new Vector3()

/**
 * The ring, fitted to and centred on a DOM slot, slowly turning, with a quick full turn on
 * each mode change. `toward` (px, from the slot centre) is where it dips on the tap.
 */
export function ModeRing({
  slot,
  progress,
  fill = 0.42,
  toward = [0, 0],
}: {
  slot: RefObject<HTMLElement | null>
  progress: RefObject<number>
  fill?: number
  toward?: [number, number]
}) {
  const g = useRef<Group>(null)
  useFrame((state, dt) => {
    const r = g.current
    const el = slot.current
    if (!r || !el) return
    const c = state.gl.domElement.getBoundingClientRect()
    const b = el.getBoundingClientRect()
    const { width: vw, height: vh } = state.viewport
    const p = progress.current * ECO_MODES
    const mode = Math.min(ECO_MODES - 1, Math.floor(p))
    const tap = tapOf(p - mode)
    const cx = b.left + b.width / 2 - c.left + toward[0] * tap
    const cy = b.top + b.height / 2 - c.top + toward[1] * tap
    to.set((cx / c.width - 0.5) * vw, (0.5 - cy / c.height) * vh + Math.sin(state.clock.elapsedTime * 1.2) * 0.02, 0)
    r.position.lerp(to, 1 - Math.exp(-dt * 12))
    // a full turn as each mode comes in, on top of a slow drift
    const turn = MathUtils.smoothstep(p - mode, 0, 0.25) + mode
    spinQ.setFromAxisAngle(Y, turn * Math.PI * 2 + state.clock.elapsedTime * 0.3)
    r.quaternion.copy(HERO).multiply(spinQ)
    // the model's radius is about 2.4 units at scale 1, so `fill` is the share of the slot it spans
    r.scale.setScalar((Math.min(b.width, b.height) * fill * vh) / c.height / 2.4)
  })
  return (
    <group ref={g}>
      <Ring />
    </group>
  )
}
