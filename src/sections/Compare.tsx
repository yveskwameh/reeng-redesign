import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { MathUtils } from 'three'
import { compareColumns, compareRows, type Mark } from '../content/compare'
import { trackSection } from '../lib/trackSection'
import { anchors } from '../scene/scrollState'

const ROWS = compareRows.length
// a bar's height at zero points: room for its score and the current mark
const BASE = '5rem'
/** A mark as points: yes 1, varies ½, no 0. */
const score = (m: Mark) => (m === 'yes' ? 1 : m === 'varies' ? 0.5 : 0)

/**
 * Reeng vs. a bank card, a phone wallet and other smart rings, as a scoreboard (after
 * ClickUp's running sums and Daylight's "wins" tally): four bars grow like a race, one
 * feature at a time as you scroll, each model (CompareModels, behind the transparent slot
 * on top of its bar) riding the top. Reeng's reaches the top; the others stall short.
 */
export function Compare() {
  const section = useRef<HTMLElement>(null)
  const [p, setP] = useState(0)

  useGSAP(
    () => {
      trackSection(section.current!, {}, setP, { drift: true })
    },
    { scope: section },
  )

  // features counted so far, continuous: each feature adds its points as it's reached
  const f = MathUtils.smoothstep(p, 0.02, 0.92) * ROWS
  const at = Math.min(ROWS - 1, Math.floor(f))
  const tally = (i: number) => compareRows.reduce((s, r, ri) => s + score(r.marks[i]) * MathUtils.clamp(f - ri, 0, 1), 0)

  return (
    <section ref={section} id="compare" className="relative h-[320svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto grid h-full max-w-6xl grid-rows-[auto_1fr] gap-6 px-5 pb-8 pt-24 md:grid-cols-[0.8fr_1.2fr] md:grid-rows-1 md:gap-12 md:px-8 md:pt-28">
          <div className="flex flex-col">
            <h2 className="display text-4xl text-ink md:text-6xl">Reeng vs. the rest.</h2>
            {/* the features, counted off */}
            <ol className="mt-8 space-y-2.5 max-md:hidden">
              {compareRows.map((r, ri) => (
                <li key={r.feature} className={`flex items-center gap-3 transition ${ri === at ? 'text-violet' : ri < at ? 'text-ink' : 'text-ash/60'}`}>
                  <span className="label-mono w-5">{String(ri + 1).padStart(2, '0')}</span>
                  <span className={ri === at ? 'font-medium' : ''}>{r.feature}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 md:hidden">
              <span className="label-mono text-ash">
                {String(at + 1).padStart(2, '0')} / {ROWS}
              </span>{' '}
              <span className="font-medium text-violet">{compareRows[at].feature}</span>
            </p>
            <p className="label-mono mt-auto pt-6 text-ash/70 max-md:hidden">Typical products in each category · features vary by provider · varies counts half</p>
          </div>

          {/* the bars */}
          <div data-reveal role="table" aria-label="How many of the eight features each option has" className="grid min-h-0 grid-cols-4 items-end gap-2 md:gap-4">
            {compareColumns.map((c, i) => {
              const s = tally(i)
              const m = compareRows[at].marks[i]
              return (
                <div key={c.id} role="row" className="flex h-full min-h-0 flex-col justify-end">
                  {/* the model rides the top of the bar */}
                  <div ref={(el) => void (anchors.compareSlots[i] = el)} aria-hidden className="aspect-square w-full shrink-0" />
                  <div className={`relative flex flex-col items-center overflow-hidden rounded-t-2xl pt-3 ${i === 0 ? 'bg-violet' : 'bg-mist'}`} style={{ height: `calc(${BASE} + ${s / ROWS} * (100% - ${BASE} - 33%))` }}>
                    <span role="cell" className={`font-display text-xl font-bold md:text-3xl ${i === 0 ? 'text-white' : 'text-ink'}`}>
                      {Math.round(s * 2) / 2}
                    </span>
                    <span role="cell" aria-label={`${c.name}: ${m === 'yes' ? 'yes' : m === 'no' ? 'no' : 'varies'}`} className="mt-1">
                      <MarkIcon mark={m} light={i === 0} />
                    </span>
                  </div>
                  <span role="rowheader" className={`label-mono mt-2 min-h-[2.6em] text-center leading-[1.3] max-md:text-[0.55rem] ${i === 0 ? 'text-violet' : 'text-ash'}`}>
                    {c.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function MarkIcon({ mark, light }: { mark: Mark; light: boolean }) {
  if (mark === 'varies') return <span className={`label-mono ${light ? 'text-white/80' : 'text-ash'}`}>Varies</span>
  if (mark === 'no')
    return (
      <svg viewBox="0 0 20 20" className={`size-4 ${light ? 'text-white/50' : 'text-ink/25'}`} aria-hidden>
        <path d="M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 20 20" className={`size-5 ${light ? 'text-white' : 'text-ink'}`} aria-hidden>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
