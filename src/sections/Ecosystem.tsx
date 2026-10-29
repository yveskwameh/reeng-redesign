import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { ModeCopy, Pulse, ResultCard } from '../components/ecosystem'
import { modes } from '../content/ecosystem'
import { trackSection } from '../lib/trackSection'
import { anchors, ecoMode } from '../scene/scrollState'

/**
 * One ring, three modes (after Zipline's huge mark behind the product, and the hero's REENG).
 * Pinned for three screens: the mode's name fills the screen behind the ring and slides over
 * to the next as you scroll, while a tint wipes across in the new mode's colour (both drawn
 * under the canvas, see Scene.tsx and Backdrop.tsx). The ring (RingRig) sits in the slot and
 * taps toward the card showing what it opens.
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

  const mode = modes[active]

  return (
    <section ref={section} id="ecosystem" className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="relative mx-auto flex h-full max-w-7xl flex-col px-5 pb-6 pt-24 md:px-8 md:pb-10 md:pt-28">
          <h2 className="display text-4xl text-ink md:text-6xl">
            One ring.
            <br />
            More taps.
          </h2>
          <div
            ref={(el) => void (anchors.ecoSlot = el)}
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[32svh] w-[32svh] -translate-x-1/2 -translate-y-1/2 max-md:top-[44%]"
          />
          <Pulse id={mode.id} color={mode.text} className="left-1/2 top-1/2 max-md:top-[44%]" />
          <div className="mt-auto flex items-end justify-between gap-6">
            <ModeCopy mode={mode} className="max-w-xs" />
            <ResultCard key={mode.id} mode={mode} className="w-72 shrink-0 animate-[fade-up_0.4s_ease-out] max-md:hidden" />
          </div>
        </div>
      </div>
    </section>
  )
}
