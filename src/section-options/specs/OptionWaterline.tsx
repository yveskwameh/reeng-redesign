import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { PRECISION, SPEC, SpecRig, specView, WATER, type SpecPlace } from './shared'

const ss = (a: number, b: number, x: number) => Math.min(1, Math.max(0, (x - a) / (b - a)))
// the surface band above the front edge, in px; the 3D ripples sit in its middle
const BAND = 28
// two periods of a gentle wave, so sliding it by half loops seamlessly
const WAVE = Array.from({ length: 41 }, (_, i) => `${i ? 'L' : 'M'} ${i * 5} ${(3 + Math.sin((i / 20) * Math.PI * 4) * 1.6).toFixed(2)}`).join(' ')

/** How far down the screen the water settles, as a fraction of its height. */
const waterline = (narrow: boolean) => (narrow ? 0.45 : 0.58)

/**
 * C — Waterline (after Apple's full-bleed water moments for its water-resistant products).
 * The dry act is a white page with the ring measured; for the water act, pale water rises
 * up the screen to a waterline. The water facts ride up with it, below the line, and the
 * ring drops through into them.
 */
export function OptionWaterline() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })
  const view = specView(p)
  // how far the water has risen: from below the screen up to the waterline (58% down; 45%
  // on phones, where the water copy sits at the bottom to leave the ring room under the line)
  const narrow = window.innerWidth < 768
  const rise = ss(SPEC.water - 0.06, SPEC.drop[0], p)
  const top = 100 - rise * (100 - waterline(narrow) * 100)

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* the water, behind the ring: the surface seen at a low angle (a thin band that
            fades back), then the body */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ top: `calc(${top}% - ${BAND}px)`, background: `linear-gradient(to bottom, #F4F1FF00 0, #EEEAFE ${BAND}px, #DCD5FB 100%)` }}
        />
        <Stage>
          <Rig progress={progress} />
        </Stage>
        {/* in front of the ring: a light tint so whatever is under the line reads as under
            water, and the front edge as a slow wave */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#DCD5FB]/30" style={{ top: `${top}%` }}>
          <svg className="absolute -top-1.5 left-0 h-3 w-[200%] animate-[wave_7s_linear_infinite]" viewBox="0 0 200 6" preserveAspectRatio="none" aria-hidden>
            <path d={WAVE} fill="none" stroke="#9730F6" strokeOpacity="0.55" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* dry: copy and the measured facts */}
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-7xl px-5 pt-24 md:px-8" style={{ opacity: 1 - rise * 0.5 }}>
          <h2 className="display text-5xl text-ink md:text-7xl">Built to last.</h2>
          <p className="mt-4 text-lg text-ash">Ceramic, measured to the tenth of a millimetre.</p>
          <dl className="mt-8 grid max-w-md grid-cols-2 gap-x-8 gap-y-5 transition-opacity duration-500 max-md:hidden" style={{ opacity: rise > 0.2 ? 0 : 1 }}>
            {PRECISION.map((c) => {
              const on = c.view === view
              return (
                <div key={c.id} className="border-t border-ink/15 pt-3">
                  <dt className={`label-mono transition-colors ${on ? 'text-violet' : 'text-ash'}`}>{c.label}</dt>
                  <dd className={`mt-1 font-display text-2xl font-bold transition-colors md:text-3xl ${on ? 'text-ink' : 'text-ink/35'}`}>{c.value}</dd>
                </div>
              )
            })}
          </dl>
        </div>

        {/* wet: rides up with the water, below the line */}
        <div
          className="pointer-events-none absolute inset-x-0 mx-auto max-w-7xl px-5 md:px-8"
          style={narrow ? { bottom: `${(1 - rise) * -40 + 6}rem` } : { top: `calc(${top}% + 1.5rem)` }}
        >
          <h3 className="display text-4xl text-ink md:text-6xl">Built for life.</h3>
          <p className="mt-2 text-lg text-ash">Swim in it. Shower in it. Never charge it.</p>
          <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
            {WATER.map((c) => (
              <div key={c.id}>
                <dt className="label-mono text-violet">{c.label}</dt>
                <dd className="font-display text-2xl font-bold text-ink md:text-3xl">{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { viewport, size } = useThree()
  const wide = viewport.aspect > 1
  const vw = viewport.width
  const vh = viewport.height
  const place = useRef<SpecPlace>({ ring: new Vector3(), ringScale: 0.6, surface: 0, dropScale: 0.4, waterX: 0, lift: 1, sink: 0.6, leader: true })
  // the 3D surface sits in the middle of the page's surface band, just above the front edge
  const surface = vh * (0.5 - waterline(!wide)) + (BAND / 2) * (vh / size.height)
  Object.assign(
    place.current,
    wide
      ? { ringScale: 0.62, surface, dropScale: 0.38, waterX: vw * 0.22, lift: 1.0, sink: 0.85, leader: true }
      : { ringScale: 0.3, surface, dropScale: 0.22, waterX: 0, lift: 0.6, sink: 0.35, leader: false },
  )
  place.current.ring.set(wide ? vw * 0.17 : 0, wide ? 0.05 : -0.6, 0)
  return <SpecRig progress={progress} place={place} bare flat />
}
