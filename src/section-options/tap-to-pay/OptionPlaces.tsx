import { useRef, useState } from 'react'
import { MathUtils } from 'three'
import { Stage } from '../../hero-options/stage'
import { PaidReceipt, tapFx, TapScene, useSectionProgress, type TapFx } from './shared'

const PLACES = [
  { word: 'COFFEE', name: 'Blue Bottle', amount: 4.2 },
  { word: 'METRO', name: 'Metro gate', amount: 2.75 },
  { word: 'MARKET', name: 'Corner Market', amount: 12.4 },
  { word: 'CINEMA', name: 'Cinema', amount: 9.0 },
]

/**
 * C — Everywhere (after Square's "Sell on the go" strip and PayPal's row of confirmed
 * orders). Scroll walks through four places; a giant pale word for each slides past behind
 * the terminal (like the hero's wordmark), the ring taps once per place, and a receipt
 * joins the row underneath each time.
 */
export function OptionPlaces() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const fx = useRef<TapFx>({ dip: 0, paid: 0 })
  const [paidCount, setPaidCount] = useState(0)

  useSectionProgress(section, (p) => {
    const seg = p * PLACES.length
    const i = Math.min(PLACES.length - 1, Math.floor(seg))
    const sub = Math.min(1, seg - i)
    fx.current = tapFx(sub)
    // done = places whose tap has landed
    setPaidCount(i + (sub >= 0.55 ? 1 : 0))
    // the word track slides one place per segment, easing between them
    const eased = i + MathUtils.smootherstep(sub, 0.75, 1)
    if (track.current) track.current.style.transform = `translateX(${-eased * 100}vw)`
  })

  return (
    <section ref={section} className="relative h-[400svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* place words, one viewport wide each, under the canvas */}
        <div ref={track} className="absolute inset-y-0 left-0 flex items-center will-change-transform">
          {PLACES.map((pl) => (
            <span
              key={pl.word}
              className="w-screen select-none text-center font-display font-bold leading-none text-mist"
              style={{ fontSize: 'clamp(5rem, 20vw, 22rem)', letterSpacing: '-0.05em' }}
            >
              {pl.word}
            </span>
          ))}
        </div>
        <Stage>
          <TapScene fx={fx} position={[0.4, -0.15, 0]} scale={0.95} narrow={{ position: [0.2, -0.35, 0], scale: 0.6 }} />
        </Stage>

        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col justify-between px-5 pb-8 pt-28 md:px-8">
          <div className="max-w-md">
            <h2 className="display text-5xl text-ink md:text-6xl">Tap. Paid.</h2>
            <p className="mt-4 text-lg text-ash">Anywhere contactless works. No phone, no card.</p>
          </div>
          <div className="flex gap-3 overflow-hidden">
            {PLACES.map((pl, i) => (
              <PaidReceipt key={pl.word} show={i < paidCount} label={pl.name} amount={`$${pl.amount.toFixed(2)}`} className="w-60 shrink-0 max-md:[&:nth-child(n+3)]:hidden" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
