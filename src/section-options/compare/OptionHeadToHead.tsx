import { useRef, useState } from 'react'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { compareColumns, compareRows, FOOTNOTE, look, MarkIcon, markLabel, score, SlotModels, ss } from './shared'

const RIVALS = [1, 2, 3]

/**
 * B — Head to head (after Swap and Front: two cards side by side, ours lifted). Reeng stays
 * on the left; scrolling brings each rival in turn into the right-hand card (bank card →
 * phone wallet → other smart rings), its model swapping in and the score updating.
 */
export function OptionHeadToHead() {
  const section = useRef<HTMLElement>(null)
  const slots = useRef<(HTMLElement | null)[]>([])
  const looks = useRef(look())
  const [p, setP] = useState(0)
  useSectionProgress(section, (v) => {
    setP(v)
    // the rival's model shrinks away at the end of its turn and grows in at the start of the next
    const n = RIVALS.length
    const seg = Math.min(n - 1, Math.floor(v * n))
    const local = v * n - seg
    RIVALS.forEach((i, k) => {
      looks.current.scale[i] = k !== seg ? 0 : (seg === 0 ? 1 : ss(0, 0.12, local)) * (seg === n - 1 ? 1 : 1 - ss(0.88, 1, local))
    })
  })
  const seg = Math.min(RIVALS.length - 1, Math.floor(p * RIVALS.length))
  const rival = RIVALS[seg]
  const total = (i: number) => compareRows.reduce((s, r) => s + score(r.marks[i]), 0)

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden px-5 pb-16 pt-20 md:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-3xl text-ink md:text-5xl">Reeng vs. the rest.</h2>
            {/* which rival, filled by scroll */}
            <div className="flex gap-1.5 rounded-full bg-mist p-1">
              {RIVALS.map((i, k) => (
                <span key={i} className={`label-mono rounded-full px-3 py-1.5 transition max-md:text-[0.6rem] ${k === seg ? 'bg-white text-ink shadow-sm' : 'text-ash'}`}>
                  {compareColumns[i].name}
                </span>
              ))}
            </div>
          </div>

          <div role="table" aria-label={`Reeng compared with ${compareColumns[rival].name}`} className="relative mt-4 md:mt-6">
            <div role="row" className="grid grid-cols-[1fr_5.5rem_5.5rem] gap-x-2 md:grid-cols-[1fr_11rem_11rem] md:gap-x-4">
              <span role="columnheader" />
              {[0, rival].map((i) => (
                <div key={i === 0 ? 'reeng' : 'rival'} role="columnheader" className={`flex flex-col items-center rounded-t-3xl pt-2 ${i === 0 ? 'bg-violet/[0.06]' : 'bg-mist'}`}>
                  <div ref={(el) => void (slots.current[i] = el)} aria-hidden className="h-12 w-full md:h-20" />
                  <span className={`label-mono mb-3 mt-1 text-center max-md:text-[0.6rem] ${i === 0 ? 'text-violet' : 'text-ash'}`}>{compareColumns[i].name}</span>
                </div>
              ))}
            </div>
            {compareRows.map((r) => (
              <div key={r.feature} role="row" className="grid grid-cols-[1fr_5.5rem_5.5rem] gap-x-2 md:grid-cols-[1fr_11rem_11rem] md:gap-x-4">
                <span role="rowheader" className="border-t border-line py-1.5 text-[0.8rem] leading-tight text-ink md:py-2.5 md:text-base">
                  {r.feature}
                </span>
                {[0, rival].map((i) => (
                  <span key={i === 0 ? 'reeng' : `rival-${i}`} role="cell" aria-label={markLabel(i, r.marks[i])} className={`flex items-center justify-center border-t border-white ${i === 0 ? 'bg-violet/[0.06]' : 'bg-mist'} animate-[fade_0.4s_ease]`}>
                    <MarkIcon mark={r.marks[i]} strong={i === 0} />
                  </span>
                ))}
              </div>
            ))}
            {/* the score */}
            <div role="row" className="grid grid-cols-[1fr_5.5rem_5.5rem] gap-x-2 md:grid-cols-[1fr_11rem_11rem] md:gap-x-4">
              <span role="rowheader" className="label-mono border-t border-line py-3 text-ash">
                Score
              </span>
              {[0, rival].map((i) => (
                <span key={i} role="cell" className={`flex items-center justify-center rounded-b-3xl py-3 font-display text-xl font-bold md:text-2xl ${i === 0 ? 'bg-violet/[0.06] text-violet' : 'bg-mist text-ash'}`}>
                  {total(i)}/{compareRows.length}
                </span>
              ))}
            </div>
          </div>
          <p className="label-mono mt-3 text-ash/70 max-md:text-[0.6rem]">{FOOTNOTE} · varies counts half</p>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <SlotModels slots={slots} look={looks} fill={0.38} />
          </Stage>
        </div>
      </div>
    </section>
  )
}
