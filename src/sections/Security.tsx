import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { scrollToY } from '../lib/useSmoothScroll'
import { trackSection } from '../lib/trackSection'
import { SECURITY, secFeature, secFeatureMid } from '../scene/scrollState'

/**
 * Pinned for four screens. The ring comes apart (SecurityFx) and a hotspot lights
 * the part behind each feature (Hotspots). Feature names are buttons that jump to it.
 */
export function Security() {
  const section = useRef<HTMLElement>(null)
  const [active, setActive] = useState(-1)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'secEnter', progress: 'sec', exit: 'secExit' }, (p) => setActive(secFeature(p)))
    },
    { scope: section },
  )

  const jump = (i: number) => {
    const el = section.current
    if (el) scrollToY(el.offsetTop + secFeatureMid(i) * (el.offsetHeight - window.innerHeight))
  }

  const current = active >= 0 ? SECURITY[active] : null
  const revoke = current?.id === 'revoke'

  return (
    <section ref={section} id="security" className="relative h-[400svh]">
      <div className="sticky top-0 flex h-svh items-start px-6 pt-32 md:items-center md:pt-0">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-md">
            <p className="label-mono text-violet-glow">04 / Security</p>
            <h2 className="display mt-4 text-5xl md:text-7xl">Locked down.</h2>
            <p className="label-mono mt-5 text-steel">Non-custodial · Export your keys anytime</p>

            <ul className="mt-8 space-y-1 md:mt-10">
              {SECURITY.map((f, i) => {
                const on = i === active
                const tone = f.id === 'revoke' ? 'coral' : 'violet-glow'
                return (
                  // only the active feature shows on small screens; the ring needs the room
                  <li key={f.id} className={on ? '' : 'hidden md:block'}>
                    <button
                      type="button"
                      onClick={() => jump(i)}
                      aria-current={on}
                      className={`w-full cursor-pointer border-l-2 py-2.5 pl-5 text-left transition-colors duration-300 ${
                        on ? (tone === 'coral' ? 'border-coral' : 'border-violet-glow') : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className={`label-mono ${on ? (tone === 'coral' ? 'text-coral' : 'text-violet-glow') : 'text-steel'}`}>
                        {String(i + 1).padStart(2, '0')} · {f.title}
                      </span>
                      <span
                        className={`grid transition-all duration-300 ${on ? 'mt-1 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <span className="overflow-hidden text-lg text-paper">{f.body}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <p className={`label-mono mt-8 transition-colors ${revoke ? 'text-coral' : 'text-steel/60'}`}>
              {revoke ? (
                'Ring revoked · tap to pay disabled'
              ) : (
                <>
                  <span className="md:hidden">Scroll for the next feature</span>
                  <span className="hidden md:inline">Scroll or pick a feature</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
