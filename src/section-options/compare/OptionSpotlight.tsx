import { useRef, useState } from 'react'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { compareColumns, compareRows, FOOTNOTE, MarkIcon, markLabel, ROWS, SlotModels, ss } from './shared'

/**
 * A — Spotlight (after Jasper, Visitors and 1Password: the product's column is a raised card
 * running the height of the table). The four models turn above their columns; as you scroll,
 * the rows fill in one by one, Reeng's ticks drawing in violet.
 */
export function OptionSpotlight() {
  const section = useRef<HTMLElement>(null)
  const slots = useRef<(HTMLElement | null)[]>([])
  const [p, setP] = useState(0)
  useSectionProgress(section, setP)
  const row = (r: number) => ss((r / ROWS) * 0.8, ((r + 1) / ROWS) * 0.8, p)

  return (
    <section ref={section} className="relative h-[220svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden px-5 pb-16 pt-20 md:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="display text-3xl text-ink md:text-5xl">Reeng vs. the rest.</h2>

          <div role="table" aria-label="Reeng compared with a bank card, a phone wallet and other smart rings" className="relative mt-5 md:mt-6">
            {/* Reeng's column: a raised card the height of the table */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/4 rounded-3xl bg-white shadow-xl shadow-violet/10 ring-2 ring-violet/30 md:left-[calc(100%*1.6/5.6)] md:w-[calc(100%/5.6)]"
            />
            <div role="row" className="relative grid grid-cols-4 md:grid-cols-[1.6fr_repeat(4,1fr)]">
              <span role="columnheader" className="hidden md:block" />
              {compareColumns.map((c, i) => (
                <div key={c.id} role="columnheader" className="flex flex-col items-center pt-2">
                  <div ref={(el) => void (slots.current[i] = el)} aria-hidden className="h-12 w-full md:h-20" />
                  <span className={`label-mono mb-2 mt-1 md:mb-3 text-center max-md:text-[0.6rem] ${i === 0 ? 'text-violet' : 'text-ash'}`}>{c.name}</span>
                </div>
              ))}
            </div>

            {compareRows.map((r, ri) => (
              <div key={r.feature} role="row" className="relative grid grid-cols-4 border-t border-line md:grid-cols-[1.6fr_repeat(4,1fr)]" style={{ opacity: 0.25 + row(ri) * 0.75 }}>
                <span role="rowheader" className="col-span-4 pt-1.5 text-[0.8rem] text-ink md:col-span-1 md:py-2.5 md:text-base">
                  {r.feature}
                </span>
                {r.marks.map((m, i) => (
                  <span key={i} role="cell" aria-label={markLabel(i, m)} className="flex items-center justify-center py-1 md:py-2.5">
                    <MarkIcon mark={m} strong={i === 0} on={row(ri)} />
                  </span>
                ))}
              </div>
            ))}
          </div>
          <p className="label-mono mt-3 text-ash/70 max-md:text-[0.6rem]">{FOOTNOTE}</p>
        </div>
        {/* models over the page, in the header slots */}
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <SlotModels slots={slots} />
          </Stage>
        </div>
      </div>
    </section>
  )
}
