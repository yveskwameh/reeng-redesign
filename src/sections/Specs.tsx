import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { product } from '../content/product'
import { trackSection } from '../lib/trackSection'
import { specAct } from '../scene/scrollState'

const { specs } = product

const precision = [
  { value: `${specs.widthMm} mm`, label: 'Wide' },
  { value: `${specs.thicknessMm} mm`, label: 'Thin' },
  { value: `${specs.weightG} g`, label: 'Light' },
  { value: 'Zirconia', label: 'Ceramic shell' },
]
const water = [
  { value: 'IP68', label: 'Swim-safe' },
  { value: '0', label: 'Times to charge' },
  { value: `${specs.warrantyYears} yr`, label: 'Warranty' },
]

/**
 * Pinned for three screens in two acts. Precision (on paper): the ring is measured
 * face-on then in profile (SpecCallouts). Water (back on ink): it drops through a
 * surface (Water). The copy and chips swap with the act.
 */
export function Specs() {
  const section = useRef<HTMLElement>(null)
  const [act, setAct] = useState<'precision' | 'water'>('precision')

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'specEnter', progress: 'spec', exit: 'specExit' }, (p) => setAct(specAct(p)))
    },
    { scope: section },
  )

  const wet = act === 'water'
  const chips = wet ? water : precision

  return (
    <section ref={section} id="specs" className={`relative h-[300svh] transition-colors duration-500 ${wet ? 'text-paper' : 'text-ink'}`}>
      <div className="sticky top-0 flex h-svh items-start px-6 pt-32 md:items-center md:pt-0">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-md">
            <p className={`label-mono ${wet ? 'text-violet-glow' : 'text-violet'}`}>06 / Specs</p>
            <h2 className="display mt-4 text-5xl md:text-7xl">{wet ? 'Built for life.' : 'Built to last.'}</h2>
            <p className={`mt-5 text-lg ${wet ? 'text-steel' : 'text-ink/60'}`}>
              {wet ? 'Swim in it. Shower in it. Never charge it.' : 'Ceramic, measured to the tenth of a millimetre.'}
            </p>

            <dl key={act} className="mt-8 grid animate-[fade-up_0.5s_ease-out] grid-cols-2 gap-x-8 gap-y-6 md:mt-12">
              {chips.map((c) => (
                <div key={c.label} className={`border-t pt-3 ${wet ? 'border-white/15' : 'border-ink/15'}`}>
                  <dt className={`label-mono ${wet ? 'text-steel' : 'text-ink/50'}`}>{c.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold md:text-3xl">{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
