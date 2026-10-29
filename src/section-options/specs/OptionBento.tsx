import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { PRECISION, SpecRig, specView, WATER, type SpecPlace } from './shared'

/**
 * B — Bento (after Robot.com's and Rivian's spec grids: big numbers in tiles with a unit
 * box). The ring sits in the large centre tile; the facts fill the tiles around it and the
 * ones the ring is showing light up. In the water act the centre tile floods and the side
 * tiles swap to the water facts.
 */
export function OptionBento() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })
  const view = specView(p)
  const wet = view === 'water'
  const tiles = wet ? WATER.map((c) => ({ ...c, on: true })) : PRECISION.map((c) => ({ ...c, on: c.view === view }))
  const left = tiles.slice(0, Math.ceil(tiles.length / 2))
  const right = tiles.slice(Math.ceil(tiles.length / 2))

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto flex h-full max-w-7xl flex-col px-5 pb-6 pt-24 md:px-8 md:pb-8">
          <div className="flex items-end justify-between gap-6">
            <h2 key={wet ? 'w' : 'd'} className="display text-5xl text-ink md:text-7xl" style={{ animation: 'fade-up .4s' }}>
              {wet ? 'Built for life.' : 'Built to last.'}
            </h2>
            <p className="hidden max-w-xs text-right text-ash md:block">{wet ? 'Swim in it. Shower in it. Never charge it.' : 'Ceramic, measured to the tenth of a millimetre.'}</p>
          </div>
          <div key={wet ? 'w' : 'd'} className="mt-6 grid min-h-0 flex-1 grid-cols-2 content-start gap-3 md:grid-cols-[1fr_2fr_1fr] md:content-stretch" style={{ animation: 'fade-up .4s' }}>
            <Column tiles={left} />
            {/* the ring's tile (the canvas shows through it) */}
            <div className={`relative order-first col-span-2 h-56 rounded-3xl md:h-auto ring-1 transition-colors duration-700 md:order-none md:col-span-1 ${wet ? 'bg-violet/5 ring-violet/20' : 'bg-mist/60 ring-line'}`}>
              <p className="label-mono absolute left-4 top-4 text-ash">{wet ? 'IP68 · 1.5 m' : view === 'side' ? 'Profile' : 'Front'}</p>
            </div>
            <Column tiles={right} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <Rig progress={progress} />
          </Stage>
        </div>
      </div>
    </section>
  )
}

function Column({ tiles }: { tiles: { id: string; value: string; label: string; on: boolean }[] }) {
  return (
    <div className="grid content-start gap-3 md:content-stretch">
      {tiles.map((t) => (
        <div key={t.id} className={`flex flex-col justify-between rounded-2xl p-3 ring-1 md:rounded-3xl md:p-5 transition duration-300 md:p-5 ${t.on ? 'bg-white shadow-lg shadow-ink/5 ring-line' : 'bg-mist/50 ring-transparent'}`}>
          <p className={`label-mono ${t.on ? 'text-violet' : 'text-ash'}`}>{t.label}</p>
          <p className={`mt-1 font-display text-xl font-bold md:mt-2 md:text-4xl ${t.on ? 'text-ink' : 'text-ink/30'}`}>{t.value}</p>
        </div>
      ))}
    </div>
  )
}

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  const place = useRef<SpecPlace>({ ring: new Vector3(), ringScale: 0.5, surface: 0, dropScale: 0.35, waterX: 0, lift: 1, sink: 0.6, leader: false })
  // centred in the middle tile on wide screens; in the top tile on phones
  Object.assign(
    place.current,
    wide
      ? { ringScale: 0.5, surface: -0.45, dropScale: 0.34, waterX: 0, lift: 0.9, sink: 0.45, leader: false }
      : { ringScale: 0.24, surface: 0.3, dropScale: 0.18, waterX: 0, lift: 0.4, sink: 0.3, leader: false },
  )
  place.current.ring.set(0, wide ? -0.2 : 0.35, 0)
  return <SpecRig progress={progress} place={place} />
}
