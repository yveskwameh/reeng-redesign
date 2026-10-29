import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { SecurityControls } from '../../components/SecurityControls'
import { ExplodedRing, SECURITY, secFeature, type PartName, type Spots } from './shared'

/**
 * E — Mix. C's split title ("Locked" top-left, "down." bottom-right, coral on revoke) frames
 * the page; the ring comes apart between the words with A's callout line from the lit part
 * to the active feature; D's app security screen sits bottom-left, setting itself as you go.
 * Each piece has its own corner, so nothing covers anything.
 */
export function OptionMix() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const spots = useRef<Spots>({})
  const lines = useRef<(SVGPathElement | null)[]>([])
  const labels = useRef<(HTMLDivElement | null)[]>([])
  const [p, setP] = useState(0)
  const active = secFeature(p)
  const revoke = SECURITY[active]?.id === 'revoke'
  // the two words drift apart while the ring comes apart
  const apart = Math.min(1, p / 0.15)

  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })

  // each callout sits to the right of the ring, level with its part (revoke: the middle)
  const place = () => {
    const c = spots.current.Center
    if (!c) return
    const narrow = window.innerWidth < 1024
    // reach past the ring's edge (the ring grows with the screen on phones and tablets)
    const reach = narrow ? Math.min(118, 72 * (window.innerWidth / 375)) : 190
    const x = c.x + reach
    SECURITY.forEach((f, i) => {
      const label = labels.current[i]
      const line = lines.current[i]
      if (!label || !line) return
      const s = f.part ? spots.current[f.part as PartName] : null
      const y = s ? s.y : c.y
      label.style.transform = `translate(${x}px, ${y}px) translateY(-50%)`
      const from = s ? s.x : c.x + reach * 0.7
      line.setAttribute('d', `M ${from} ${y} L ${x - 12} ${y}`)
    })
  }

  return (
    <section ref={section} className="relative h-[420svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* C: the split title, in two opposite corners */}
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8 lg:pb-8">
          <h2 className="display relative h-full text-[clamp(4rem,min(13vw,22vh),13rem)] leading-[0.85] text-ink">
            <span className="absolute left-0 top-0 block" style={{ transform: `translate(${-apart * 1.5}vw, ${-apart}vh)` }}>
              Locked
            </span>
            <span className={`absolute bottom-0 right-0 block transition-colors duration-500 ${revoke ? 'text-coral' : ''}`} style={{ transform: `translate(${apart * 1.5}vw, ${apart}vh)` }}>
              down.
            </span>
          </h2>
        </div>

        <Stage>
          <Rig progress={progress} spots={spots} onFrame={place} />
        </Stage>

        {/* A: the callout for the active feature, drawn from its part */}
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
              strokeDashoffset={i === active ? 0 : 1}
              className={`transition-[stroke-dashoffset,opacity] duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
        </svg>
        {SECURITY.map((f, i) => (
          <div
            key={f.id}
            ref={(el) => void (labels.current[i] = el)}
            className={`pointer-events-none absolute left-0 top-0 w-64 max-lg:w-40 md:max-lg:w-60 transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className={`label-mono ${f.id === 'revoke' ? 'text-coral' : 'text-violet'}`}>
              {String(i + 1).padStart(2, '0')} · {f.title}
            </p>
            <p className="mt-1 text-sm text-ink md:text-base lg:text-lg">{f.body}</p>
          </div>
        ))}

        {/* D: the app's security screen, bottom-left (above "down." on phones) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-[11.5rem] md:px-8 lg:pb-8">
          <p className="label-mono mb-3 text-ash">Non-custodial · Export your keys anytime</p>
          <SecurityControls p={p} compact />
        </div>
      </div>
    </section>
  )
}

function Rig({ progress, spots, onFrame }: { progress: React.RefObject<number>; spots: React.RefObject<Spots>; onFrame: () => void }) {
  const { viewport, size } = useThree()
  // same breakpoint as the page's lg: layout (tablets use the stacked phone layout)
  const wide = size.width >= 1024
  const at = useRef(new Vector3())
  // wide: right of centre, between the words; phones: left, leaving room for the callout
  at.current.set(wide ? viewport.width * 0.1 : -viewport.width * 0.2, wide ? -0.05 : viewport.height * 0.11, 0)
  useFrame(onFrame)
  return <ExplodedRing progress={progress} at={at} spots={spots} scale={wide ? 0.32 : Math.min(0.3, 0.22 * (size.width / 375))} tilt={0.4} />
}
