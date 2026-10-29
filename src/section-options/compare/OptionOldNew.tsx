import { useRef, useState } from 'react'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { compareRows, FOOTNOTE, MarkIcon, ROWS, SlotModels, ss, type Mark } from './shared'

const SHORT = ['', 'Card', 'Phone', 'Other rings']

/** What the rest manage on one feature: who has it, who it varies for. */
function rest(marks: readonly Mark[]) {
  const yes = [1, 2, 3].filter((i) => marks[i] === 'yes').map((i) => SHORT[i])
  const varies = [1, 2, 3].filter((i) => marks[i] === 'varies').map((i) => SHORT[i])
  if (yes.length === 3) return 'All of them'
  if (!yes.length && !varies.length) return 'None of them'
  return [yes.length ? `${yes.join(' & ')} only` : 'None for sure', varies.length ? `${varies.join(' & ')}: varies` : ''].filter(Boolean).join(' · ')
}

/**
 * D — Old way, new way (after Daylight's "Typical / Built different" panels and Ploy's
 * today-vs-tomorrow table). The usual ways to pay share one muted panel, their three models
 * in its header; Reeng gets the violet one. Scrolling goes down the features: each gap in
 * the old way is struck through as Reeng's answer lights up beside it.
 */
export function OptionOldNew() {
  const section = useRef<HTMLElement>(null)
  const slots = useRef<(HTMLElement | null)[]>([])
  const [p, setP] = useState(0)
  useSectionProgress(section, setP)
  const row = (r: number) => ss((r / ROWS) * 0.8 + 0.04, ((r + 1) / ROWS) * 0.8 + 0.04, p)

  return (
    <section ref={section} className="relative h-[260svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden px-4 pb-16 pt-20 md:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="display text-3xl text-ink md:text-5xl">Reeng vs. the rest.</h2>

          <div role="table" aria-label="The usual ways to pay compared with Reeng" className="relative mt-6 grid grid-cols-2 gap-x-2 md:mt-8 md:gap-x-4">
            {/* the two panels, behind the rows */}
            <div aria-hidden className="absolute inset-y-0 left-0 w-[calc(50%-0.25rem)] rounded-3xl bg-mist md:w-[calc(50%-0.5rem)]" />
            <div aria-hidden className="absolute inset-y-0 right-0 w-[calc(50%-0.25rem)] rounded-3xl bg-violet md:w-[calc(50%-0.5rem)]" />

            <div role="row" className="contents">
              <div role="columnheader" className="relative p-3 md:p-6">
                <p className="label-mono text-ash max-md:text-[0.6rem]">The usual way</p>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} ref={(el) => void (slots.current[i] = el)} aria-hidden className="h-10 flex-1 md:h-20" />
                  ))}
                </div>
                <p className="font-display text-sm font-bold text-ash md:text-2xl">Card, phone, ring</p>
              </div>
              <div role="columnheader" className="relative p-3 md:p-6">
                <p className="label-mono text-white/70 max-md:text-[0.6rem]">The Reeng way</p>
                <div ref={(el) => void (slots.current[0] = el)} aria-hidden className="mt-2 h-10 md:h-20" />
                <p className="font-display text-sm font-bold text-white md:text-2xl">One ring</p>
              </div>
            </div>

            {compareRows.map((r, ri) => {
              const on = row(ri)
              const gap = r.marks.slice(1).some((m) => m !== 'yes')
              return (
                <div key={r.feature} role="row" className="contents">
                  <div role="cell" className="relative mx-3 border-t border-ink/10 py-1.5 md:mx-6 md:py-2.5">
                    {/* struck through line by line as it's reached (each wrapped line gets its own strike) */}
                    <span
                      className="text-[0.7rem] leading-tight text-ash [box-decoration-break:clone] md:text-sm"
                      style={{
                        opacity: 1 - (gap ? on * 0.5 : 0),
                        background: gap ? `linear-gradient(var(--color-coral), var(--color-coral)) 0 55% / ${on * 100}% 1px no-repeat` : undefined,
                      }}
                    >
                      {rest(r.marks)}
                    </span>
                  </div>
                  <div role="cell" className="relative mx-3 flex items-center gap-2 border-t border-white/20 py-1.5 md:mx-6 md:py-2.5" style={{ opacity: 0.35 + on * 0.65 }}>
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white [&_svg]:size-3.5">
                      <MarkIcon mark="yes" strong on={on} />
                    </span>
                    <span className="text-[0.7rem] leading-tight text-white md:text-sm">{r.feature}</span>
                  </div>
                </div>
              )
            })}
            <div role="row" className="contents">
              <div className="h-3 md:h-5" />
              <div className="h-3 md:h-5" />
            </div>
          </div>
          <p className="label-mono mt-3 text-ash/70 max-md:text-[0.6rem]">{FOOTNOTE}</p>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <SlotModels slots={slots} fill={0.46} />
          </Stage>
        </div>
      </div>
    </section>
  )
}
