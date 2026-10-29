import { useRef, useState } from 'react'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { compareColumns, compareRows, FOOTNOTE, MarkIcon, markLabel, ROWS, score, SlotModels, ss } from './shared'

/**
 * C — Scoreboard (after ClickUp's running sums and Daylight's "wins" tally). Four columns
 * grow like a bar race, one feature at a time as you scroll, each model riding the top of
 * its bar. Reeng's reaches the top; the others stall where they fall short.
 */
export function OptionScoreboard() {
  const section = useRef<HTMLElement>(null)
  const slots = useRef<(HTMLElement | null)[]>([])
  const [p, setP] = useState(0)
  useSectionProgress(section, setP)
  // features counted so far, continuous: each feature adds its score as it's reached
  const f = ss(0.02, 0.92, p) * ROWS
  const at = Math.min(ROWS - 1, Math.floor(f))
  const tally = (i: number) => compareRows.reduce((s, r, ri) => s + score(r.marks[i]) * Math.min(1, Math.max(0, f - ri)), 0)

  return (
    <section ref={section} className="relative h-[320svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto grid h-full max-w-6xl grid-rows-[auto_1fr] gap-6 px-5 pb-20 pt-24 md:grid-cols-[0.8fr_1.2fr] md:grid-rows-1 md:gap-12 md:px-8 md:pt-28">
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
            <p className="label-mono mt-auto pt-6 text-ash/70 max-md:hidden">{FOOTNOTE} · varies counts half</p>
          </div>

          {/* the bars */}
          <div role="table" aria-label="How many of the eight features each option has" className="grid min-h-0 grid-cols-4 items-end gap-2 md:gap-4">
            {compareColumns.map((c, i) => {
              const s = tally(i)
              const m = compareRows[at].marks[i]
              return (
                <div key={c.id} role="row" className="flex h-full min-h-0 flex-col justify-end">
                  {/* the model rides the top of the bar */}
                  <div ref={(el) => void (slots.current[i] = el)} aria-hidden className="aspect-square w-full shrink-0" />
                  <div
                    className={`relative flex flex-col items-center rounded-t-2xl pt-3 ${i === 0 ? 'bg-violet' : 'bg-mist'}`}
                    style={{ height: `calc(3.5rem + ${s / ROWS} * (100% - 3.5rem - 33%))`, flexBasis: 'auto' }}
                  >
                    <span role="cell" className={`font-display text-xl font-bold md:text-3xl ${i === 0 ? 'text-white' : 'text-ink'}`}>
                      {Math.round(s * 2) / 2}
                    </span>
                    <span role="cell" aria-label={markLabel(i, m)} className={`mt-1 ${i === 0 ? '[&_svg]:text-white [&_span]:text-white/80' : ''}`}>
                      <MarkIcon mark={m} />
                    </span>
                  </div>
                  <span role="rowheader" className={`label-mono mt-2 text-center max-md:text-[0.55rem] ${i === 0 ? 'text-violet' : 'text-ash'}`}>
                    {c.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <SlotModels slots={slots} fill={0.36} />
          </Stage>
        </div>
      </div>
    </section>
  )
}
