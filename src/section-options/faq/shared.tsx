import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { Euler, Quaternion, Vector3, type Group } from 'three'
import { faq, faqTopics, type FaqTopic } from '../../content/faq'
import { Ring } from '../../scene/Ring'

export { faq, faqTopics, type FaqTopic }
export * from '../../components/faq'

export const TOPICS = ['All', ...faqTopics] as const
export type Topic = (typeof TOPICS)[number]
export const byTopic = (t: Topic) => (t === 'All' ? faq : faq.filter((f) => f.topic === t))
/** Topic filter chips. */
export function Chips({ value, onChange, counts = false, className = '' }: { value: Topic; onChange: (t: Topic) => void; counts?: boolean; className?: string }) {
  return (
    <div role="tablist" aria-label="FAQ topics" className={`flex flex-wrap gap-2 ${className}`}>
      {TOPICS.map((t) => (
        <button
          key={t}
          role="tab"
          type="button"
          aria-selected={t === value}
          onClick={() => onChange(t)}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-sm transition ${t === value ? 'bg-ink text-white' : 'bg-mist text-ash hover:text-ink'}`}
        >
          {t}
          {counts && <span className={`ml-1.5 ${t === value ? 'text-white/50' : 'text-ash/60'}`}>{byTopic(t).length}</span>}
        </button>
      ))}
    </div>
  )
}

// a pose per topic: how the ring best shows what the answers are about
const POSES: Record<Topic, Quaternion> = {
  All: new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35)), // the hero's 3/4
  Setup: new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35)),
  Payments: new Quaternion().setFromEuler(new Euler(0.45, 0, 0.1)), // lying flat, as on a terminal
  Security: new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)), // face-on, the hole facing you
  Hardware: new Quaternion().setFromEuler(new Euler(0, 0.6, Math.PI / 2)), // side profile, turned enough to read as a ring
  Orders: new Quaternion().setFromEuler(new Euler(1.0, 0, 0.35)), // 3/4 from the other side
}
const spinQ = new Quaternion()
const target = new Quaternion()
const Y = new Vector3(0, 1, 0)
const to = new Vector3()

/** The ring fitted to a DOM slot, easing into the pose for the current topic and slowly turning. */
export function TopicRing({ slot, topic, fill = 0.6 }: { slot: RefObject<HTMLElement | null>; topic: RefObject<Topic>; fill?: number }) {
  const g = useRef<Group>(null)
  const spin = useRef(0)
  useFrame((state, dt) => {
    const r = g.current
    const el = slot.current
    if (!r || !el) return
    const c = state.gl.domElement.getBoundingClientRect()
    const b = el.getBoundingClientRect()
    const { width: vw, height: vh } = state.viewport
    const cx = b.left + b.width / 2 - c.left
    const cy = b.top + b.height / 2 - c.top
    to.set((cx / c.width - 0.5) * vw, (0.5 - cy / c.height) * vh + Math.sin(state.clock.elapsedTime * 1.2) * 0.02, 0)
    r.position.lerp(to, 1 - Math.exp(-dt * 12))
    spin.current += dt * 0.35
    target.copy(POSES[topic.current]).multiply(spinQ.setFromAxisAngle(Y, spin.current))
    r.quaternion.slerp(target, 1 - Math.exp(-dt * 5))
    // the model's diameter is about 2.4 units at scale 1, so `fill` is the share of the slot it spans
    r.scale.setScalar((Math.min(b.width, b.height) * fill * vh) / c.height / 2.4)
  })
  return (
    <group ref={g}>
      <Ring />
    </group>
  )
}
