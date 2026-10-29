import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useState } from 'react'
import { SecurityControls } from '../components/SecurityControls'
import { trackSection } from '../lib/trackSection'
import { SEC, SECURITY, secFeature, scrollState, secFx, type PartName } from '../scene/scrollState'

/**
 * Pinned for four screens. A split title frames the page — "Locked" top-left, "down."
 * bottom-right, coral on revoke — while the ring comes apart between the words (RingFx).
 * A callout line runs from the lit part (SecuritySpots) to the active feature, and the
 * app's security screen bottom-left sets each control as you reach it. Each piece has its
 * own corner, so nothing covers anything; below lg it stacks.
 */
export function Security() {
  const section = useRef<HTMLElement>(null)
  const sticky = useRef<HTMLDivElement>(null)
  const lines = useRef<(SVGPathElement | null)[]>([])
  const labels = useRef<(HTMLDivElement | null)[]>([])
  const [p, setP] = useState(0)
  const active = secFeature(p)
  const revoke = SECURITY[active]?.id === 'revoke'
  // the two words drift apart while the ring comes apart
  const apart = Math.min(1, p / SEC.explode)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'secEnter', progress: 'sec', exit: 'secExit' }, setP, { drift: true })

      // each callout sits to the right of the ring, level with its part (revoke: the middle)
      const place = () => {
        const frame = sticky.current?.getBoundingClientRect()
        if (!frame || scrollState.secEnter < 0.01 || scrollState.secExit > 0.99) return
        const c = secFx.Center
        const narrow = window.innerWidth < 1024
        // reach past the ring's edge (the ring grows with the screen on phones and tablets)
        const reach = narrow ? Math.min(118, 72 * (window.innerWidth / 375)) : 190
        const x = c.x + reach
        // once the section unpins the ring flies on to the next one; the callout stays behind
        const hide = scrollState.secExit > 0.02 ? 'hidden' : ''
        SECURITY.forEach((f, i) => {
          const label = labels.current[i]
          const line = lines.current[i]
          if (!label || !line) return
          label.style.visibility = hide
          line.style.visibility = hide
          const s = f.part ? secFx[f.part as PartName] : null
          // secFx is in viewport px; the labels live in the pinned frame
          const y = (s ? s.y : c.y) - frame.top
          label.style.transform = `translate(${x}px, ${y}px) translateY(-50%)`
          line.setAttribute('d', `M ${s ? s.x : c.x + reach * 0.7} ${y} L ${x - 12} ${y}`)
        })
      }
      gsap.ticker.add(place)
      return () => gsap.ticker.remove(place)
    },
    { scope: section },
  )

  return (
    <section ref={section} id="security" className="relative h-[420svh] text-ink">
      <div ref={sticky} className="sticky top-0 h-svh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8 lg:pb-8">
          <h2 className="display relative h-full text-[clamp(4rem,min(13vw,22vh),13rem)] leading-[0.85]">
            <span className="absolute left-0 top-0 block" style={{ transform: `translate(${-apart * 1.5}vw, ${-apart}vh)` }}>
              Locked
            </span>
            <span className={`absolute bottom-0 right-0 block transition-colors duration-500 ${revoke ? 'text-coral' : ''}`} style={{ transform: `translate(${apart * 1.5}vw, ${apart}vh)` }}>
              down.
            </span>
          </h2>
        </div>

        {/* the callout for the active feature, drawn from its part */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {SECURITY.map((f, i) => (
            <path
              key={f.id}
              ref={(el) => void (lines.current[i] = el)}
              fill="none"
              stroke={f.id === 'revoke' ? '#FF5A4E' : '#9730F6'}
              strokeWidth="1.5"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={i === active ? 0 : 1}
              className={`transition-[stroke-dashoffset,opacity] duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
        </svg>
        {SECURITY.map((f, i) => (
          <div
            key={f.id}
            ref={(el) => void (labels.current[i] = el)}
            aria-hidden={i !== active}
            className={`pointer-events-none absolute left-0 top-0 w-64 transition-opacity duration-500 max-lg:w-40 md:max-lg:w-60 ${i === active ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className={`label-mono ${f.id === 'revoke' ? 'text-coral' : 'text-violet'}`}>
              {String(i + 1).padStart(2, '0')} · {f.title}
            </p>
            <p className="mt-1 text-sm md:text-base lg:text-lg">{f.body}</p>
          </div>
        ))}

        {/* the app's security screen, bottom-left (above "down." below lg) */}
        <div data-reveal className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-[11.5rem] md:px-8 lg:pb-8">
          <p className="label-mono mb-3 text-ash">Non-custodial · Export your keys anytime</p>
          <SecurityControls p={p} compact />
        </div>
      </div>
    </section>
  )
}
