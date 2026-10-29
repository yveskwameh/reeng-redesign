import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three'
import { product } from '../../content/product'
import { Ring } from '../../scene/Ring'

export { product }

/** 0 as the section's top meets the bottom of the screen, 1 once it reaches the top. */
export function useEnter(section: RefObject<HTMLElement | null>) {
  const [e, setE] = useState(0)
  const live = useRef(0)
  useEffect(() => {
    const update = () => {
      const el = section.current
      if (!el) return
      const v = MathUtils.clamp(1 - el.getBoundingClientRect().top / window.innerHeight, 0, 1)
      live.current = v
      setE(v)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [section])
  return { e, live }
}

export const ss = (a: number, b: number, x: number) => MathUtils.smoothstep(x, a, b)

/** The closing copy's parts, as in the current section. */
export const EARLY = `Early bird · $${product.price.earlyBird}`
export const SUB = 'Stablecoins on your finger. Tap anywhere contactless works.'
export const FOOT = `${product.commerce.shipping} · ${product.specs.warrantyYears}-year warranty`

export function Buttons({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a href="/#order" className={`rounded-full px-7 py-3.5 font-medium transition ${light ? 'bg-white text-violet hover:bg-mist' : 'bg-violet text-white hover:bg-ink'}`}>
        Order — ${product.price.earlyBird}
      </a>
      <a href="/#faq" className={`rounded-full px-7 py-3.5 font-medium transition ${light ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-mist text-ink hover:bg-line'}`}>
        Questions
      </a>
    </div>
  )
}

const POSE = {
  hero: new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35)),
  face: new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)),
}
// where it comes from: side-on, below
const START = new Quaternion().setFromEuler(new Euler(0, 0.4, Math.PI / 2))
const spinQ = new Quaternion()
const target = new Quaternion()
const Y = new Vector3(0, 1, 0)
const to = new Vector3()

/**
 * The ring fitted to a DOM slot. It rises in from below as the section comes in (`enter`
 * 0 → 1), turning from side-on into its pose, then keeps a slow turn.
 */
export function CtaRing({
  slot,
  enter,
  pose = 'hero',
  fill = 0.8,
  from = [0, 0.7],
}: {
  slot: RefObject<HTMLElement | null>
  enter: RefObject<number>
  pose?: keyof typeof POSE
  fill?: number
  /** where it starts, in screens from the slot: [right, down] */
  from?: [number, number]
}) {
  const g = useRef<Group>(null)
  useFrame((state, dt) => {
    const r = g.current
    const el = slot.current
    if (!r || !el) return
    const c = state.gl.domElement.getBoundingClientRect()
    const b = el.getBoundingClientRect()
    const { width: vw, height: vh } = state.viewport
    const k = ss(0.25, 1, enter.current)
    const cx = b.left + b.width / 2 - c.left + (1 - k) * from[0] * window.innerWidth
    const cy = b.top + b.height / 2 - c.top + (1 - k) * from[1] * window.innerHeight
    to.set((cx / c.width - 0.5) * vw, (0.5 - cy / c.height) * vh + Math.sin(state.clock.elapsedTime * 1.2) * 0.02 * k, 0)
    r.position.lerp(to, 1 - Math.exp(-dt * 10))
    // a face-on ring spins in its own plane (around the camera axis), the rest around their own axis
    spinQ.setFromAxisAngle(Y, state.clock.elapsedTime * 0.35 + (1 - k) * 3)
    target.copy(START).slerp(POSE[pose], k).multiply(spinQ)
    r.quaternion.slerp(target, 1 - Math.exp(-dt * 8))
    // the model's diameter is about 2.4 units at scale 1, so `fill` is the share of the slot it spans
    r.scale.setScalar((Math.min(b.width, b.height) * fill * vh) / c.height / 2.4)
  })
  return (
    <group ref={g}>
      <Ring />
    </group>
  )
}
