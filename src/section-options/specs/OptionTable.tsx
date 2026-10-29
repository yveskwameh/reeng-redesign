import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { PRECISION, SpecRig, specView, WATER, type SpecPlace } from './shared'

/**
 * D — Spec table (after Fauna Robotics' and Oura's tech-spec panels beside the product). A
 * clean table on the left with Precision / Water tabs that switch with the act; the rows the
 * ring is showing are marked, the rest stay readable. The ring is measured on the right.
 */
export function OptionTable() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })
  const view = specView(p)
  const wet = view === 'water'

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <Rig progress={progress} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col px-5 pt-24 md:justify-center md:px-8 md:pt-0">
          <div className="md:max-w-md">
            <h2 key={wet ? 'w' : 'd'} className="display text-5xl text-ink md:text-7xl" style={{ animation: 'fade-up .4s' }}>
              {wet ? 'Built for life.' : 'Built to last.'}
            </h2>
            <p className="mt-4 text-lg text-ash">{wet ? 'Swim in it. Shower in it. Never charge it.' : 'Ceramic, measured to the tenth of a millimetre.'}</p>

            <div className="mt-8 max-md:absolute max-md:inset-x-5 max-md:bottom-20 md:mt-10">
              <div className="inline-flex rounded-full bg-mist p-1">
                {['Precision', 'Water'].map((t) => (
                  <span key={t} className={`rounded-full px-4 py-1.5 text-sm transition ${(t === 'Water') === wet ? 'bg-ink text-white' : 'text-ash'}`}>
                    {t}
                  </span>
                ))}
              </div>
              <dl key={wet ? 'w' : 'd'} className="mt-4 divide-y divide-line border-y border-line" style={{ animation: 'fade-up .4s' }}>
                {(wet ? WATER.map((c) => ({ ...c, on: true })) : PRECISION.map((c) => ({ ...c, on: c.view === view }))).map((c) => (
                  <div key={c.id} className={`flex items-baseline justify-between py-2.5 md:py-3 ${c.on ? '' : 'max-md:hidden'}`}>
                    <dt className={`flex items-center gap-2 text-sm transition-colors ${c.on ? 'text-ink' : 'text-ash'}`}>
                      <span className={`size-1.5 rounded-full transition-colors ${c.on ? 'bg-violet' : 'bg-line'}`} />
                      {c.label}
                    </dt>
                    <dd className={`font-display text-lg font-bold transition-colors md:text-xl ${c.on ? 'text-ink' : 'text-ink/40'}`}>{c.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  const vw = viewport.width
  const place = useRef<SpecPlace>({ ring: new Vector3(), ringScale: 0.7, surface: 0, dropScale: 0.45, waterX: 0, lift: 1.3, sink: 0.8, leader: true })
  Object.assign(
    place.current,
    wide
      ? { ringScale: 0.62, surface: -0.35, dropScale: 0.42, waterX: vw * 0.15, lift: 1.3, sink: 0.8, leader: true }
      : { ringScale: 0.3, surface: 0.0, dropScale: 0.24, waterX: 0, lift: 0.7, sink: 0.45, leader: false },
  )
  place.current.ring.set(wide ? vw * 0.15 : 0, 0.1, 0)
  return <SpecRig progress={progress} place={place} />
}
