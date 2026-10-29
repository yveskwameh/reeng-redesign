import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { PRECISION, SpecRig, specView, WATER, type SpecPlace } from './shared'

/**
 * A — Spec sheet (after Bang & Olufsen's product spec sheets on Pinterest). The section is
 * a technical drawing: a faint grid, the ring measured with dimension lines, and a title
 * block along the bottom whose cells light up as the drawing shows them. In the water act
 * the sheet turns to sheet 2 and the block swaps to the water facts.
 */
export function OptionSheet() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })
  const view = specView(p)
  const wet = view === 'water'
  const cells = wet ? WATER.map((c) => ({ ...c, on: true })) : PRECISION.map((c) => ({ ...c, on: c.view === view }))

  return (
    <section ref={section} className="relative h-[300svh]">
      <div
        className="sticky top-0 h-svh overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(#EFEEF3 1px, transparent 1px), linear-gradient(90deg, #EFEEF3 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      >
        <Stage>
          <Rig progress={progress} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col px-5 pb-6 pt-24 md:px-8 md:pb-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 key={wet ? 'w' : 'd'} className="display text-5xl text-ink md:text-7xl" style={{ animation: 'fade-up .4s' }}>
                {wet ? 'Built for life.' : 'Built to last.'}
              </h2>
              <p className="mt-4 text-lg text-ash">{wet ? 'Swim in it. Shower in it. Never charge it.' : 'Ceramic, measured to the tenth of a millimetre.'}</p>
            </div>
            <p className="label-mono hidden text-right text-ash md:block">
              Reeng · Onyx
              <br />
              Sheet {wet ? '2' : '1'} / 2 · {wet ? 'Water' : view === 'side' ? 'Profile' : 'Front'}
            </p>
          </div>

          {/* the title block */}
          <dl key={wet ? 'w' : 'd'} className="mt-auto grid grid-cols-2 border-l border-t border-ink/15 bg-white/80 backdrop-blur md:grid-cols-5" style={{ animation: 'fade-up .4s' }}>
            {cells.map((c) => (
              <div key={c.id} className={`border-b border-r border-ink/15 px-4 py-3 transition-colors duration-300 ${c.on ? 'bg-white' : 'bg-transparent'}`}>
                <dt className={`label-mono transition-colors ${c.on ? 'text-violet' : 'text-ash'}`}>{c.label}</dt>
                <dd className={`mt-1 font-display text-xl font-bold transition-colors md:text-2xl ${c.on ? 'text-ink' : 'text-ink/35'}`}>{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  const vw = viewport.width
  const place = useRef<SpecPlace>({ ring: new Vector3(), ringScale: 0.6, surface: 0, dropScale: 0.4, waterX: 0, lift: 1, sink: 0.6, leader: true })
  Object.assign(
    place.current,
    wide
      ? { ringScale: 0.6, surface: -0.25, dropScale: 0.4, waterX: vw * 0.12, lift: 1.1, sink: 0.6, leader: true }
      : { ringScale: 0.3, surface: -0.45, dropScale: 0.25, waterX: 0, lift: 0.7, sink: 0.45, leader: false },
  )
  place.current.ring.set(wide ? vw * 0.12 : 0, wide ? 0.15 : -0.35, 0)
  return <SpecRig progress={progress} place={place} />
}
