import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { trackSection } from '../lib/trackSection'
import { TAP } from '../scene/scrollState'

const steps = [
  { n: '01', label: 'Hover', at: 0 },
  { n: '02', label: 'Tap', at: TAP.touch },
  { n: '03', label: 'Paid · 0.8 s', at: TAP.paid },
]

/**
 * Pinned for three screens of scroll. The 3D scene (RingRig, Terminal) reads
 * the progress this section writes into scrollState; the copy just tracks the phase.
 */
export function TapToPay() {
  const section = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState(0)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'tapEnter', progress: 'tap', exit: 'tapExit' }, (p) =>
        setPhase(p >= TAP.paid ? 2 : p >= TAP.touch ? 1 : 0),
      )
    },
    { scope: section },
  )

  return (
    <section ref={section} id="tap-to-pay" className="relative h-[300svh]">
      <div className="sticky top-0 flex h-svh items-start px-6 pt-32 md:items-center md:pt-0">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-md">
            <p className="label-mono text-violet-glow">01 / Tap to pay</p>
            <h2 className="display mt-4 text-5xl md:text-7xl">
              Tap. <span className={phase === 2 ? 'text-lime transition-colors' : 'transition-colors'}>Paid.</span>
            </h2>
            <p className="mt-5 text-lg text-steel">Works at any contactless card terminal. No phone, no card.</p>

            <ol className="mt-10 hidden gap-6 md:flex">
              {steps.map((s, i) => (
                <li
                  key={s.n}
                  className={`label-mono border-t pt-3 transition-colors duration-300 ${
                    i === phase
                      ? i === 2
                        ? 'border-lime text-lime'
                        : 'border-violet-glow text-paper'
                      : i < phase
                        ? 'border-white/30 text-steel'
                        : 'border-white/10 text-steel/50'
                  }`}
                >
                  {s.n} · {s.label}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
