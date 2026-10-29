import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { MathUtils, type Group } from 'three'
import { compareColumns, compareRows, type Mark } from '../../content/compare'
import { CompareModelMesh, RADIUS } from '../../scene/CompareModels'

export { compareColumns, compareRows, type Mark }
export const ROWS = compareRows.length

export const ss = (a: number, b: number, x: number) => MathUtils.smoothstep(x, a, b)

/** A mark as a number: yes 1, varies ½, no 0. */
export const score = (m: Mark) => (m === 'yes' ? 1 : m === 'varies' ? 0.5 : 0)

/** Per model: a scale multiplier and a drop in px (both eased toward each frame). */
export type Look = { scale: number[]; drop: number[] }
export const look = (): Look => ({ scale: [1, 1, 1, 1], drop: [0, 0, 0, 0] })

/**
 * The four compare models (Reeng, bank card, phone wallet, another ring), each fitted to
 * and centred on a DOM slot, by model index; a missing slot hides its model. Rings spin;
 * the card and phone sway so their faces stay readable. `look` shrinks or sinks them.
 */
export function SlotModels({ slots, look, fill = 0.42 }: { slots: RefObject<(HTMLElement | null)[]>; look?: RefObject<Look>; fill?: number }) {
  const models = useRef<(Group | null)[]>([])
  const eased = useRef(look ? { scale: [1, 1, 1, 1], drop: [0, 0, 0, 0] } : null)

  useFrame((state, dt) => {
    const { width: vw, height: vh } = state.viewport
    const c = state.gl.domElement.getBoundingClientRect()
    const pxToWorld = vh / c.height
    const t = state.clock.elapsedTime
    models.current.forEach((g, i) => {
      if (!g) return
      const r = slots.current[i]?.getBoundingClientRect()
      g.visible = !!r && r.width > 0 && r.bottom > c.top && r.top < c.bottom
      if (!r || !g.visible) return
      let k = 1
      let drop = 0
      if (eased.current && look?.current) {
        const e = eased.current
        e.scale[i] = MathUtils.damp(e.scale[i], look.current.scale[i], 6, dt)
        e.drop[i] = MathUtils.damp(e.drop[i], look.current.drop[i], 6, dt)
        k = e.scale[i]
        drop = e.drop[i]
      }
      const cx = r.left + r.width / 2 - c.left
      const cy = r.top + r.height / 2 - c.top + drop
      g.position.set((cx / c.width - 0.5) * vw, (0.5 - cy / c.height) * vh, 0)
      g.scale.setScalar(((Math.min(r.width, r.height) * fill * pxToWorld) / RADIUS[i]) * k)
      const flat = i === 1 || i === 2
      g.rotation.set(flat ? 0.15 : 0.35, flat ? Math.sin(t * 0.8 + i) * 0.6 : t * 0.6 + i * 1.3, flat ? 0 : 0.1)
    })
  })

  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} ref={(g) => void (models.current[i] = g)} visible={false}>
          <CompareModelMesh i={i} />
        </group>
      ))}
    </>
  )
}

/** Yes: a tick (violet for Reeng); no: a dash; varies: the word. `on` draws it in. */
export function MarkIcon({ mark, strong, on = 1 }: { mark: Mark; strong?: boolean; on?: number }) {
  if (mark === 'varies')
    return (
      <span className="label-mono text-ash" style={{ opacity: on }}>
        Varies
      </span>
    )
  if (mark === 'no')
    return (
      <svg viewBox="0 0 20 20" className="size-4 text-ink/25" aria-hidden style={{ opacity: on }}>
        <path d="M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 20 20" className={`size-5 ${strong ? 'text-violet' : 'text-ink'}`} aria-hidden>
      <path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - on}
      />
    </svg>
  )
}

export const markLabel = (i: number, m: Mark) => `${compareColumns[i].name}: ${m === 'yes' ? 'yes' : m === 'no' ? 'no' : 'varies'}`

export const FOOTNOTE = 'Typical products in each category · features vary by provider'
