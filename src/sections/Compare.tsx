import { compareColumns, compareRows, type Mark } from '../content/compare'
import { anchors } from '../scene/scrollState'

/**
 * Reeng vs. a bank card, a phone wallet and other smart rings. The header cells are
 * transparent slots; small rotating 3D models (CompareModels) render behind them.
 * Desktop: label column + 4 columns. Phone: each label sits above its row of 4 marks.
 */
export function Compare() {
  return (
    <section id="compare" className="relative px-6 py-28 md:py-36">
      <div className="mx-auto w-full max-w-6xl">
        <p className="label-mono text-violet-glow">08 / Compare</p>
        <h2 className="display mt-4 text-5xl md:text-7xl">Reeng vs. the rest.</h2>

        <div role="table" aria-label="Reeng compared with a bank card, a phone wallet and other smart rings" className="mt-12 md:mt-16">
          {/* header: model slots + names */}
          <div role="row" className="grid grid-cols-4 md:grid-cols-[1.6fr_repeat(4,1fr)]">
            <span role="columnheader" className="hidden md:block" />
            {compareColumns.map((c, i) => (
              <div
                key={c.id}
                role="columnheader"
                className={`flex flex-col items-center rounded-t-2xl pt-2 ${i === 0 ? 'bg-violet/10' : ''}`}
              >
                <div ref={(el) => void (anchors.compareSlots[i] = el)} aria-hidden className="h-24 w-full md:h-32" />
                <span className={`label-mono mt-2 mb-4 text-center ${i === 0 ? 'text-violet-glow' : 'text-steel'}`}>{c.name}</span>
              </div>
            ))}
          </div>

          {compareRows.map((row, r) => (
            <div key={row.feature} role="row" className="grid grid-cols-4 border-t border-white/10 md:grid-cols-[1.6fr_repeat(4,1fr)]">
              <span role="rowheader" className="col-span-4 pt-4 text-paper md:col-span-1 md:py-5">
                {row.feature}
              </span>
              {row.marks.map((m, i) => (
                <span
                  key={i}
                  role="cell"
                  aria-label={`${compareColumns[i].name}: ${m === 'yes' ? 'yes' : m === 'no' ? 'no' : 'varies'}`}
                  className={`flex items-center justify-center py-3 md:py-5 ${i === 0 ? 'bg-violet/10' : ''} ${
                    i === 0 && r === compareRows.length - 1 ? 'rounded-b-2xl' : ''
                  }`}
                >
                  <MarkIcon mark={m} strong={i === 0} />
                </span>
              ))}
            </div>
          ))}
        </div>

        <p className="label-mono mt-8 text-steel/60">Typical products in each category · features vary by provider</p>
      </div>
    </section>
  )
}

function MarkIcon({ mark, strong }: { mark: Mark; strong: boolean }) {
  if (mark === 'varies') return <span className="label-mono text-steel">Varies</span>
  if (mark === 'no')
    return (
      <svg viewBox="0 0 20 20" className="size-4 text-steel/50" aria-hidden>
        <path d="M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 20 20" className={`size-5 ${strong ? 'text-lime' : 'text-paper'}`} aria-hidden>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
