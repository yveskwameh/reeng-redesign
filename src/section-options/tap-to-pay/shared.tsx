import { RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { MathUtils, Quaternion, Vector3, type Group, type Mesh, type MeshBasicMaterial, type Object3D } from 'three'
import { Ring } from '../../scene/Ring'
import { createScreen, type ScreenPhase } from '../../scene/screenTexture'

/** Per-frame tap state the DOM writes and the scene reads: 0→1 dip onto the reader, 0/1 paid. */
export type TapFx = { dip: number; paid: number }

const Y = new Vector3(0, 1, 0)
const touch = new Vector3()
const normal = new Vector3()
const aq = new Quaternion()
const rq = new Quaternion()

/**
 * A card terminal tilted back like it sits on a counter, with the ring hovering off its
 * contactless mark and coming down onto it as `fx.dip` goes 0 → 1. Ripples while touching;
 * the screen flips to PAID on `fx.paid`.
 */
export function TapScene({
  fx,
  position = [0, 0, 0],
  scale = 1,
  ringScale = 0.3,
  narrow,
}: {
  fx: RefObject<TapFx>
  position?: [number, number, number]
  scale?: number
  ringScale?: number
  /** position and scale on portrait screens */
  narrow?: { position: [number, number, number]; scale: number }
}) {
  const portrait = useThree((st) => st.viewport.aspect < 0.9)
  if (portrait && narrow) ({ position, scale } = narrow)
  const ring = useRef<Group>(null)
  const anchor = useRef<Object3D>(null)
  const ripples = useRef<(Mesh | null)[]>([])
  const screen = useMemo(() => createScreen(), [])
  const shown = useRef<ScreenPhase>('ready')

  useFrame((state, dt) => {
    const { dip, paid } = fx.current
    const phase: ScreenPhase = paid > 0.5 ? 'paid' : 'ready'
    if (phase !== shown.current) {
      shown.current = phase
      screen.draw(phase)
    }
    ripples.current.forEach((m, i) => {
      if (!m) return
      const w = (state.clock.elapsedTime * 0.9 + i / 3) % 1
      m.scale.setScalar(0.25 + w * 1.1)
      ;(m.material as MeshBasicMaterial).opacity = (1 - w) * 0.8 * MathUtils.smoothstep(dip, 0.6, 1) * (1 - paid)
    })

    const a = anchor.current
    const g = ring.current
    if (!a || !g) return
    a.getWorldPosition(touch)
    normal.set(0, 0, 1).applyQuaternion(a.getWorldQuaternion(aq))
    const s = ringScale * scale
    // touching: lying on the face around the mark; hovering: lifted off it and to the left
    touch.addScaledVector(normal, 0.4 * s + 0.01)
    const lift = (1 - dip) * (0.6 * scale)
    g.position.copy(touch).addScaledVector(normal, lift)
    g.position.x -= (1 - dip) * 0.85 * scale
    g.position.y += Math.sin(state.clock.elapsedTime * 1.2) * 0.04 * (1 - dip)
    rq.setFromUnitVectors(Y, normal)
    g.quaternion.slerp(rq, 1 - Math.exp(-dt * 8))
    g.scale.setScalar(s)
  })

  return (
    <>
      <group position={position} scale={scale} rotation={[-0.85, -0.25, 0]}>
        <RoundedBox args={[1.25, 1.9, 0.16]} radius={0.07} smoothness={6}>
          <meshPhysicalMaterial color="#1A1A22" roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.2} />
        </RoundedBox>
        <mesh position={[0, 0.38, 0.081]}>
          <planeGeometry args={[1.02, 0.88]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
        <group position={[0, -0.5, 0.082]} ref={anchor}>
          {[0.1, 0.17, 0.24].map((r) => (
            <mesh key={r} rotation={[0, 0, -Math.PI / 4]} position={[-0.08, 0, 0]}>
              <ringGeometry args={[r, r + 0.022, 32, 1, 0, Math.PI / 2]} />
              <meshBasicMaterial color="#8A8A99" />
            </mesh>
          ))}
          {[0, 1, 2].map((i) => (
            <mesh key={i} ref={(m) => void (ripples.current[i] = m)} position={[0, 0, 0.002]}>
              <ringGeometry args={[0.38, 0.4, 64]} />
              <meshBasicMaterial color="#9730F6" transparent opacity={0} toneMapped={false} depthWrite={false} />
            </mesh>
          ))}
        </group>
      </group>
      <group ref={ring}>
        <Ring />
      </group>
    </>
  )
}

/** Hover → touch → lift timeline inside 0…1 (same beats as the home page's TAP constants). */
export const TAP_BEATS = { touch: 0.35, paid: 0.55 } as const
export function tapFx(p: number): TapFx {
  const dip = MathUtils.smoothstep(p, 0.1, TAP_BEATS.touch) * (1 - MathUtils.smoothstep(p, TAP_BEATS.paid + 0.1, 0.95))
  return { dip, paid: p >= TAP_BEATS.paid ? 1 : 0 }
}

/**
 * Pinned-section scroll progress (0 at the section top reaching the viewport top, 1 when its
 * bottom reaches the viewport bottom). Calls `onChange` on every scroll with the progress.
 */
export function useSectionProgress(section: RefObject<HTMLElement | null>, onChange: (p: number) => void) {
  const cb = useRef(onChange)
  useEffect(() => {
    cb.current = onChange
  })
  useEffect(() => {
    const update = () => {
      const el = section.current
      if (!el) return
      const r = el.getBoundingClientRect()
      cb.current(MathUtils.clamp(-r.top / (r.height - window.innerHeight), 0, 1))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [section])
}

export const PaidReceipt = ({ show, label = 'Paid in 0.8 s', amount = '$50.00', className = '' }: { show: boolean; label?: string; amount?: string; className?: string }) => (
  <div
    className={`flex w-72 items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-line transition duration-300 ${
      show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
    } ${className}`}
  >
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lime text-sm text-ink">✓</span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="label-mono text-ash">USDC · Base</p>
    </div>
    <p className="font-mono text-sm text-ink">{amount}</p>
  </div>
)
