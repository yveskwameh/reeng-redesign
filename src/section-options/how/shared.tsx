import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three'
import { createPhoneScreen, viewKey, type PhoneView } from '../../scene/phoneScreen'
import { Ring } from '../../scene/Ring'

export const STEPS = [
  { n: '01', title: 'Pair', body: 'Hold your Reeng to your phone. Done in a tap.' },
  { n: '02', title: 'Fund', body: 'Send stablecoins from any chain to your Reeng address.' },
  { n: '03', title: 'Tap', body: 'Set your PIN and limits. Then pay anywhere.' },
]

export const stepAt = (p: number) => Math.min(2, Math.floor(p * 3))
export const subAt = (p: number) => Math.min(1, p * 3 - stepAt(p))

/** What the app shows at progress `p` (0–1 across all three steps). */
export function viewAt(p: number): PhoneView {
  const step = stepAt(p)
  const sub = subAt(p)
  if (step === 0) return { step: 'pair', paired: sub > 0.55 }
  if (step === 1) return { step: 'fund', balance: Math.min(3, Math.floor(sub * 4)) * 50 }
  return { step: 'tap' }
}

// ring keyframes in the phone's frame: held to its edge (pair) → floating (fund) → out front (tap)
const KEYS = [
  { pos: new Vector3(-0.62, 0.45, 0.25), rot: new Quaternion().setFromEuler(new Euler(0.2, 0.3, Math.PI / 2)) },
  { pos: new Vector3(-0.95, -0.55, 0.3), rot: new Quaternion().setFromEuler(new Euler(1.0, 0.2, -0.5)) },
  { pos: new Vector3(-1.3, -0.1, 0.5), rot: new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35)) },
]
const pos = new Vector3()
const rot = new Quaternion()

/**
 * The phone running the Reeng app, with the ring beside it moving through the three setup
 * steps as `progress` goes 0 → 1. Position the whole rig with `at` (world units, read
 * every frame so the DOM can steer it) and `scale`.
 */
export function PhoneRig({
  progress,
  at,
  scale = 1,
  ring = true,
}: {
  progress: RefObject<number>
  at: RefObject<Vector3>
  scale?: number
  ring?: boolean
}) {
  const rig = useRef<Group>(null)
  const phone = useRef<Group>(null)
  const ringRef = useRef<Group>(null)
  const screen = useMemo(() => createPhoneScreen(), [])
  const shown = useRef('')

  useFrame((state, dt) => {
    const p = progress.current
    const t = state.clock.elapsedTime
    const g = rig.current
    if (!g) return
    g.position.lerp(at.current, 1 - Math.exp(-dt * 8))
    g.scale.setScalar(scale)

    const v = viewAt(p)
    const key = viewKey(v)
    if (key !== shown.current) {
      shown.current = key
      screen.draw(v)
    }
    if (phone.current) {
      const yaw = MathUtils.lerp(-0.45, -0.18, MathUtils.smoothstep(p, 0.07, 0.13))
      phone.current.rotation.set(0.06, yaw + Math.sin(t * 0.6) * 0.04, 0)
    }
    const r = ringRef.current
    if (r) {
      const k1 = MathUtils.smoothstep(p, 0.28, 0.4)
      const k2 = MathUtils.smoothstep(p, 0.61, 0.73)
      pos.copy(KEYS[0].pos).lerp(KEYS[1].pos, k1).lerp(KEYS[2].pos, k2)
      pos.y += Math.sin(t * 1.2) * 0.03
      rot.copy(KEYS[0].rot).slerp(KEYS[1].rot, k1).slerp(KEYS[2].rot, k2)
      r.position.lerp(pos, 1 - Math.exp(-dt * 8))
      r.quaternion.slerp(rot, 1 - Math.exp(-dt * 8))
      r.scale.setScalar(MathUtils.lerp(0.3, 0.36, k2))
    }
  })

  return (
    <group ref={rig}>
      <group ref={phone}>
        <RoundedBox args={[1.0, 2.05, 0.1]} radius={0.12} smoothness={6}>
          <meshPhysicalMaterial color="#16161c" metalness={0.6} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
        </RoundedBox>
        <mesh position={[0, 0, 0.051]}>
          <planeGeometry args={[0.9, 1.92]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
      </group>
      {ring && (
        <group ref={ringRef}>
          <Ring />
        </group>
      )}
    </group>
  )
}

/** Screenshot of the app at a given view, for 2D phone mockups in the DOM. */
export function phoneShot(v: PhoneView) {
  const s = createPhoneScreen()
  s.draw(v)
  return (s.texture.image as HTMLCanvasElement).toDataURL()
}
