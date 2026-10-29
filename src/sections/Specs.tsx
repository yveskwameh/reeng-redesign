import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { product } from '../content/product'
import { innerDiameter } from '../content/sizing'
import { trackSection } from '../lib/trackSection'
import { specRise, specView, specWaterline } from '../scene/scrollState'

const { specs } = product

// each fact is tagged with the view of the ring that shows it
const precision = [
  { id: 'dia', value: `${innerDiameter(9).toFixed(1)} mm`, label: 'Inner Ø · US 9', view: 'front' },
  { id: 'thick', value: `${specs.thicknessMm} mm`, label: 'Thin', view: 'front' },
  { id: 'width', value: `${specs.widthMm} mm`, label: 'Wide', view: 'side' },
  { id: 'weight', value: `${specs.weightG} g`, label: 'Light', view: 'side' },
  { id: 'shell', value: 'Zirconia', label: 'Ceramic shell', view: 'side' },
]
const water = [
  { id: 'ip', value: 'IP68', label: 'Swim-safe' },
  { id: 'charge', value: '0', label: 'Times to charge' },
  { id: 'warranty', value: `${specs.warrantyYears} yr`, label: 'Warranty' },
]

// two periods of a gentle wave, so sliding it by half loops seamlessly
const WAVE = Array.from({ length: 41 }, (_, i) => `${i ? 'L' : 'M'} ${i * 5} ${(3 + Math.sin((i / 20) * Math.PI * 4) * 1.6).toFixed(2)}`).join(' ')

/**
 * Pinned for three screens in two acts. Precision: the ring is measured face-on then in
 * profile (SpecCallouts) while the facts it shows light up. Water: pale water rises up the
 * screen to a waterline (the body behind the ring is drawn under the canvas, by Backdrop;
 * the tint and wavy front edge here, in front of it), carrying the water facts, and the ring
 * drops through with a splash, ripples and bubbles (Water).
 */
export function Specs() {
  const section = useRef<HTMLElement>(null)
  const [p, setP] = useState(0)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'specEnter', progress: 'spec', exit: 'specExit' }, setP, { drift: true })
    },
    { scope: section },
  )

  const view = specView(p)
  const rise = specRise(p)
  const line = specWaterline()
  const top = (1 - rise * (1 - line)) * 100
  // narrow screens: the water copy sits at the bottom, leaving the ring room under the line
  const narrow = line < 0.5

  return (
    <section ref={section} id="specs" className="relative h-[300svh] text-ink">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* in front of the ring: a light tint so whatever is under the line reads as under
            water, and the front edge as a slow wave */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#DCD5FB]/30" style={{ top: `${top}%`, visibility: rise > 0 ? 'visible' : 'hidden' }}>
          <svg className="absolute -top-1.5 left-0 h-3 w-[200%] animate-[wave_7s_linear_infinite]" viewBox="0 0 200 6" preserveAspectRatio="none" aria-hidden>
            <path d={WAVE} fill="none" stroke="#9730F6" strokeOpacity="0.55" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* dry: the copy and the measured facts, centred level with the ring on wide screens */}
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-7xl px-5 pt-24 md:bottom-0 md:flex md:flex-col md:justify-center md:px-8 md:pt-0" style={{ opacity: 1 - rise * 0.5 }}>
          <h2 className="display text-5xl md:text-7xl">Built to last.</h2>
          <p className="mt-4 text-lg text-ash">Ceramic, measured to the tenth of a millimetre.</p>
          <dl className="mt-8 grid max-w-md grid-cols-2 gap-x-8 gap-y-5 transition-opacity duration-500 max-md:hidden" style={{ opacity: rise > 0.2 ? 0 : 1 }}>
            {precision.map((c) => {
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
          <h3 className="display text-4xl md:text-6xl">Built for life.</h3>
          <p className="mt-2 text-lg text-ash">Swim in it. Shower in it. Never charge it.</p>
          <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
            {water.map((c) => (
              <div key={c.id}>
                <dt className="label-mono text-violet">{c.label}</dt>
                <dd className="font-display text-2xl font-bold md:text-3xl">{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
