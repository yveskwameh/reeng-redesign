import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { product } from '../content/product'
import { CARD_SHORT_MM, circumference, DEFAULT_PX_PER_MM, innerDiameter, sizeFromDiameter } from '../content/sizing'
import { setScrollLocked } from '../lib/useSmoothScroll'

const { sizes } = product
type Method = 'screen' | 'print' | 'kit'

const methods: { id: Method; title: string; note: string }[] = [
  { id: 'screen', title: 'On screen', note: 'No printer' },
  { id: 'print', title: 'Print', note: 'A4 sizer' },
  { id: 'kit', title: 'Sizing kit', note: 'Free' },
]

const printSteps = ['Print at 100% — a bank card should match the bar', 'Cut out the strip', 'Wrap it around your finger', 'Read the number at the arrow']

type Props = {
  open: boolean
  onClose: () => void
  onPick: (size: number) => void
  kit: boolean
  onKit: (on: boolean) => void
}

/**
 * "Find your size": measure on screen (calibrate with a bank card, then match a ring
 * you own), print the client's A4 sizer, or get a free sizing kit. Plus a size chart.
 * Right-hand drawer on desktop, bottom sheet on phones.
 */
export function SizeDrawer({ open, onClose, onPick, kit, onKit }: Props) {
  const [method, setMethod] = useState<Method>('screen')
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setScrollLocked(true)
    panel.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => {
      setScrollLocked(false)
      window.removeEventListener('keydown', esc)
    }
  }, [open, onClose])

  // portal to <body> so it sits above the nav (sections live in main's z-10 stacking context)
  return createPortal(
    <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Find your size"
        tabIndex={-1}
        data-lenis-prevent
        className={`absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-3xl bg-paper p-6 text-ink outline-none transition-transform duration-500 ease-out md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[440px] md:rounded-none md:p-8 ${
          open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full md:translate-y-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="label-mono text-violet">Find your size</p>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer text-2xl leading-none text-ink/50 hover:text-ink">
            ×
          </button>
        </div>
        <h3 className="display mt-3 text-3xl">Three ways.</h3>

        <div role="tablist" className="mt-6 grid grid-cols-3 gap-2">
          {methods.map((m) => (
            <button
              key={m.id}
              role="tab"
              type="button"
              aria-selected={m.id === method}
              onClick={() => setMethod(m.id)}
              className={`cursor-pointer rounded-xl border p-3 text-left transition ${
                m.id === method ? 'border-violet bg-violet/10' : 'border-ink/10 hover:border-ink/30'
              }`}
            >
              <span className="block text-sm font-medium">{m.title}</span>
              <span className="label-mono text-ink/50">{m.note}</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          {method === 'screen' && <OnScreen onPick={onPick} />}
          {method === 'print' && (
            <div>
              <ol className="space-y-3">
                {printSteps.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="label-mono mt-0.5 text-violet">{String(i + 1).padStart(2, '0')}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <a
                href="/downloads/reeng-ring-sizer-A4.pdf"
                download
                className="mt-6 block rounded-full bg-ink py-3 text-center font-medium text-paper hover:bg-violet"
              >
                Download the A4 sizer (PDF)
              </a>
              <p className="label-mono mt-3 text-ink/50">Between two sizes? Pick the larger one.</p>
            </div>
          )}
          {method === 'kit' && (
            <div>
              <p>We'll send a free set of sizing rings first, then ship your Reeng once you confirm the fit.</p>
              <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 p-4">
                <input type="checkbox" checked={kit} onChange={(e) => onKit(e.target.checked)} className="size-5 accent-violet" />
                <span className="font-medium">Send me a free sizing kit</span>
              </label>
              {kit && (
                <button type="button" onClick={onClose} className="mt-4 w-full cursor-pointer rounded-full bg-ink py-3 font-medium text-paper hover:bg-violet">
                  Done
                </button>
              )}
            </div>
          )}
        </div>

        <details className="mt-8 border-t border-ink/10 pt-4">
          <summary className="label-mono cursor-pointer text-ink/60">Size chart</summary>
          <table className="mt-3 w-full font-mono text-sm">
            <thead className="text-ink/50">
              <tr>
                <th className="py-1 text-left font-normal">US</th>
                <th className="py-1 text-right font-normal">Inside Ø</th>
                <th className="py-1 text-right font-normal">Around</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((s) => (
                <tr key={s} className="border-t border-ink/5">
                  <td className="py-1.5">{s}</td>
                  <td className="py-1.5 text-right">{innerDiameter(s).toFixed(1)} mm</td>
                  <td className="py-1.5 text-right">{circumference(s).toFixed(1)} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    </div>,
    document.body,
  )
}

/**
 * Two-step on-screen sizer. Screens differ in pixel density, so first calibrate:
 * match a bank card's short edge. Then resize a circle to a ring you own.
 */
function OnScreen({ onPick }: { onPick: (size: number) => void }) {
  const [step, setStep] = useState<'card' | 'ring'>('card')
  const [cardPx, setCardPx] = useState(Math.round(CARD_SHORT_MM * DEFAULT_PX_PER_MM))
  const [ringPx, setRingPx] = useState(Math.round(innerDiameter(9) * DEFAULT_PX_PER_MM))

  const pxPerMm = cardPx / CARD_SHORT_MM
  const mm = ringPx / pxPerMm
  const size = sizeFromDiameter(mm, sizes)

  if (step === 'card')
    return (
      <div>
        <p className="label-mono text-ink/50">Step 1 of 2 · Calibrate</p>
        <p className="mt-2">Hold the short edge of any bank card against the screen and drag until the bar matches it.</p>
        <div className="mt-5 flex h-28 flex-col items-center justify-center">
          {/* width bar with end stops — only the width matters */}
          <div className="flex h-16 items-stretch" style={{ width: cardPx }} aria-label={`Calibration bar, ${cardPx} pixels wide`}>
            <span className="w-0.5 bg-violet" />
            <span className="flex flex-1 items-center">
              <span className="h-0.5 w-full bg-violet" />
            </span>
            <span className="w-0.5 bg-violet" />
          </div>
          <span className="label-mono mt-2 text-ink/50">Card short edge · {CARD_SHORT_MM} mm</span>
        </div>
        <input
          type="range"
          min={120}
          max={380}
          value={cardPx}
          onChange={(e) => setCardPx(+e.target.value)}
          aria-label="Card outline width"
          className="mt-4 w-full accent-violet"
        />
        <button type="button" onClick={() => setStep('ring')} className="mt-5 w-full cursor-pointer rounded-full bg-ink py-3 font-medium text-paper hover:bg-violet">
          It matches
        </button>
      </div>
    )

  return (
    <div>
      <p className="label-mono text-ink/50">Step 2 of 2 · Match a ring you own</p>
      <p className="mt-2">Lay a ring that fits on the screen and drag until the circle meets its inside edge.</p>
      <div className="mt-5 flex h-40 items-center justify-center">
        <div
          className="rounded-full border-2 border-violet"
          style={{ width: ringPx, height: ringPx }}
          aria-label={`Ring circle, ${mm.toFixed(1)} millimetres`}
        />
      </div>
      <input
        type="range"
        min={Math.round(13 * pxPerMm)}
        max={Math.round(24 * pxPerMm)}
        value={ringPx}
        onChange={(e) => setRingPx(+e.target.value)}
        aria-label="Ring circle size"
        className="mt-4 w-full accent-violet"
      />
      <p className="mt-4 flex items-baseline justify-between">
        <span className="font-mono text-ink/60">Ø {mm.toFixed(1)} mm</span>
        <span className="font-display text-2xl font-bold">US {size}</span>
      </p>
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={() => setStep('card')} className="cursor-pointer rounded-full border border-ink/15 px-5 py-3 text-sm">
          Recalibrate
        </button>
        <button type="button" onClick={() => onPick(size)} className="flex-1 cursor-pointer rounded-full bg-violet py-3 font-medium text-white hover:bg-ink">
          Use US {size}
        </button>
      </div>
    </div>
  )
}
