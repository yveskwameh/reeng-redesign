import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { ExplodedRing, SECURITY, secFeature, type PartName, type Spots } from './shared'

// which side each callout sits on: the chip and the antenna share a height, so they split
const LEFT = [true, false, true, false, false]

/**
 * A — Callouts (after the exploded product shots on Pinterest: JBL Flip 7, earbuds, Rains).
 * The ring comes apart into a vertical stack in the middle; as you scroll, a leader line
 * draws from each part to its feature, either side. Earlier callouts stay, faded.
 */
export function OptionCallouts() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const spots = useRef<Spots>({})
  const lines = useRef<(SVGPathElement | null)[]>([])
  const labels = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(-1)

  // place each callout beside its part's hotspot and draw the leader line to it
  const place = () => {
    const W = window.innerWidth
    const narrow = W < 768
    SECURITY.forEach((f, i) => {
      const label = labels.current[i]
      const line = lines.current[i]
      if (!label || !line) return
      const s = f.part ? spots.current[f.part as PartName] : null
      const left = LEFT[i]
      // revoke has no part: its callout sits under the ring
      // callouts sit a short reach either side of the ring's middle
      const x = narrow ? W / 2 : left ? W / 2 - 240 : W / 2 + 240
      const y = narrow ? window.innerHeight - 170 : s ? s.y : window.innerHeight * 0.82
      label.style.transform = `translate(${narrow ? '-50%' : left ? '-100%' : '0'}, -50%) translate(${x}px, ${y}px)`
      line.setAttribute('d', s ? `M ${s.x} ${s.y} L ${narrow ? s.x : x} ${narrow ? y - 40 : y}` : '')
    })
  }

  useSectionProgress(section, (p) => {
    progress.current = p
    setActive(secFeature(p))
  })

  return (
    <section ref={section} className="relative h-[420svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <Rig progress={progress} spots={spots} onFrame={place} />
        </Stage>
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {SECURITY.map((f, i) => (
            <path
              key={f.id}
              ref={(el) => void (lines.current[i] = el)}
              fill="none"
              stroke={f.id === 'revoke' ? '#FF5A4E' : '#9730F6'}
              strokeWidth="1.5"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={i <= active ? 0 : 1}
              className={`transition-[stroke-dashoffset,opacity] duration-700 ${i === active ? 'opacity-100' : i < active ? 'opacity-25 max-md:opacity-0' : 'opacity-0'}`}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-7xl px-5 pt-24 md:px-8">
          <h2 className="display text-5xl text-ink md:text-7xl">Locked down.</h2>
          <p className="label-mono mt-4 text-ash">Non-custodial · Export your keys anytime</p>
        </div>
        {SECURITY.map((f, i) => {
          const left = LEFT[i]
          return (
            <div
              key={f.id}
              ref={(el) => void (labels.current[i] = el)}
              className={`pointer-events-none absolute left-0 top-0 w-64 transition-opacity duration-500 max-md:w-[calc(100vw-2.5rem)] max-md:text-center ${left ? 'md:pr-4 md:text-right' : 'md:pl-4'} ${
                i === active ? 'opacity-100' : i < active ? 'opacity-35 max-md:opacity-0' : 'opacity-0'
              }`}
            >
              <p className={`label-mono ${f.id === 'revoke' ? 'text-coral' : 'text-violet'}`}>
                {String(i + 1).padStart(2, '0')} · {f.title}
              </p>
              <p className="mt-1 text-lg text-ink">{f.body}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Rig({ progress, spots, onFrame }: { progress: React.RefObject<number>; spots: React.RefObject<Spots>; onFrame: () => void }) {
  const { viewport } = useThree()
  const narrow = viewport.aspect < 1
  const at = useRef(new Vector3(0, narrow ? 0 : -0.3, 0))
  useFrame(onFrame)
  return <ExplodedRing progress={progress} at={at} spots={spots} scale={narrow ? 0.32 : 0.42} tilt={0.35} />
}
