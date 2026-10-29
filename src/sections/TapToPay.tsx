import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { PLACES } from '../content/places'
import { trackSection } from '../lib/trackSection'
import { TAP, tapPlace } from '../scene/scrollState'

/**
 * Pinned, one stretch of scroll per place (content/places.ts; one is enough to get it across). The 3D scene does the work
 * (Terminal, RingRig, CameraRig): the ring taps, the screen approves, a receipt prints out
 * of the terminal and tears off, and the camera eases in and out around each tap. Behind
 * it a giant place name slides past (Scene). Here: the copy and a receipt card per place.
 */
export function TapToPay() {
  const section = useRef<HTMLElement>(null)
  const [paid, setPaid] = useState(0)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'tapEnter', progress: 'tap', exit: 'tapExit' }, (p) => {
        const { i, sub } = tapPlace(p)
        setPaid(i + (sub >= TAP.paid ? 1 : 0))
      }, { drift: true })
    },
    { scope: section },
  )

  return (
    <section ref={section} id="tap-to-pay" className="relative text-ink" style={{ height: `${100 + 120 * TAP.places}svh` }}>
      <div className="sticky top-0 h-svh">
        <div className="mx-auto flex h-full max-w-7xl flex-col justify-between px-5 pb-6 pt-28 md:px-8 md:pb-8">
          <div className="max-w-md">
            <h2 className="display text-5xl md:text-7xl">
              Tap. <span className={`transition-colors duration-300 ${paid > 0 ? 'text-violet' : ''}`}>Paid.</span>
            </h2>
            <p className="mt-5 text-lg text-ash">Anywhere contactless works. No phone, no card.</p>
          </div>

          {/* one receipt card per place, landing as each tap is approved; no overflow clipping,
              it would cut off the cards' outline and shadow (they shrink to fit instead) */}
          <ul className="flex gap-3">
            {PLACES.map((pl, i) => (
              <li
                key={pl.word}
                className={`flex w-60 min-w-0 shrink items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-line transition duration-500 max-md:[&:nth-child(n+3)]:hidden ${
                  i < paid ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                }`}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lime text-sm max-md:hidden">✓</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{pl.merchant}</p>
                  <p className="label-mono truncate text-ash">USDC · 0.8 s</p>
                </div>
                <p className="font-mono text-sm">${pl.amount.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
