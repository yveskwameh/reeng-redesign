import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { modes } from '../content/ecosystem'
import { scrollToY } from '../lib/useSmoothScroll'
import { trackSection } from '../lib/trackSection'
import { ecoMode, ecoModeMid } from '../scene/scrollState'

/**
 * Pinned for three screens on paper. The ring switches mode (Pay → ID → Events);
 * EcoCard flips to what a tap opens in each. Mode tabs jump to their segment.
 */
export function Ecosystem() {
  const section = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'ecoEnter', progress: 'eco', exit: 'ecoExit' }, (p) => setActive(ecoMode(p)))
    },
    { scope: section },
  )

  const jump = (i: number) => {
    const el = section.current
    if (el) scrollToY(el.offsetTop + ecoModeMid(i) * (el.offsetHeight - window.innerHeight))
  }
  const mode = modes[active]

  return (
    <section ref={section} id="ecosystem" className="relative h-[300svh] text-ink">
      <div className="sticky top-0 flex h-svh items-start px-6 pt-32 md:items-center md:pt-0">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-md">
            <p className="label-mono text-violet">09 / Ecosystem</p>
            <h2 className="display mt-4 text-5xl md:text-7xl">One ring. More taps.</h2>

            <div role="tablist" aria-label="Ring modes" className="mt-8 inline-flex rounded-full border border-ink/10 bg-white/60 p-1 md:mt-10">
              {modes.map((m, i) => (
                <button
                  key={m.id}
                  role="tab"
                  type="button"
                  aria-selected={i === active}
                  onClick={() => jump(i)}
                  className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300 ${
                    i === active ? 'text-white' : 'text-ink/50 hover:text-ink'
                  }`}
                  style={i === active ? { background: m.text } : undefined}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <div key={mode.id} role="tabpanel" className="mt-6 animate-[fade-up_0.4s_ease-out]">
              <p className="label-mono" style={{ color: mode.text }}>
                {mode.product}
              </p>
              <p className="mt-2 text-lg text-ink/70">{mode.body}</p>
              {mode.href ? (
                <a href={mode.href} target="_blank" rel="noreferrer" className="label-mono mt-4 inline-block underline underline-offset-4" style={{ color: mode.text }}>
                  Visit {mode.product} ↗
                </a>
              ) : (
                <p className="label-mono mt-4 text-ink/40">You’re here</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
