import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { product } from '../content/product'
import { trackSection } from '../lib/trackSection'
import { howStep } from '../scene/scrollState'

const steps = [
  { n: '01', title: 'Pair', body: 'Hold your Reeng to your phone. Done in a tap.' },
  { n: '02', title: 'Fund', body: 'Send stablecoins from any chain to your Reeng address.' },
  { n: '03', title: 'Tap', body: 'Set your PIN and limits. Then pay anywhere.' },
]

/**
 * Pinned for three screens on paper (the canvas backdrop fades ink → paper).
 * The phone screen and ring follow the step; the copy highlights it.
 */
export function HowItWorks() {
  const section = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'howEnter', progress: 'how', exit: 'howExit' }, (p) => setStep(howStep(p)))
    },
    { scope: section },
  )

  return (
    <section ref={section} id="how-it-works" className="relative h-[300svh] text-ink">
      <div className="sticky top-0 flex h-svh items-start px-6 pt-32 md:items-center md:pt-0">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-md">
            <p className="label-mono text-violet">03 / How it works</p>
            <h2 className="display mt-4 text-5xl md:text-7xl">Pair. Fund. Tap.</h2>

            <ol className="mt-8 space-y-1 md:mt-12">
              {steps.map((s, i) => {
                const active = i === step
                return (
                  <li
                    key={s.n}
                    // only the active step shows on small screens, to leave room for the phone
                    className={`border-l-2 py-3 pl-5 transition-colors duration-300 ${
                      active ? 'border-violet' : 'hidden border-ink/10 md:block'
                    }`}
                  >
                    <p className={`label-mono ${active ? 'text-violet' : 'text-ink/40'}`}>
                      {s.n} · {s.title}
                    </p>
                    <p className={`mt-1 text-lg transition-colors ${active ? 'text-ink' : 'text-ink/35'}`}>{s.body}</p>
                  </li>
                )
              })}
            </ol>

            <p className="label-mono mt-8 text-ink/45">
              App {product.app.status === 'coming-soon' ? 'coming soon' : 'available'} · {product.app.platforms.join(' & ')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
