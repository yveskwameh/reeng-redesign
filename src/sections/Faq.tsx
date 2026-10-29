import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { QA } from '../components/faq'
import { faq, faqTopics } from '../content/faq'
import { trackSection } from '../lib/trackSection'
import { scrollToY } from '../lib/useSmoothScroll'
import { anchors, faqTopic, faqTopicMid } from '../scene/scrollState'

// FAQPage structured data, so answers can show up directly in search results
const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})

/**
 * Pinned, one stop per topic: scrolling steps Setup → Payments → Security → Hardware →
 * Orders. A numbered list of topics fills, each topic's first answer opens on its own, and
 * the ring (RingRig, in the slot beside the title) turns to the topic's pose. Tap a topic to jump to
 * it, or any question to open it.
 */
export function Faq() {
  const section = useRef<HTMLElement>(null)
  const [p, setP] = useState(0)
  const [picked, setPicked] = useState<{ at: number; q: string | null } | null>(null)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'faqEnter', progress: 'faq', exit: 'faqExit' }, setP, { drift: true })
    },
    { scope: section },
  )

  const at = faqTopic(p)
  const topic = faqTopics[at]
  const items = faq.filter((f) => f.topic === topic)
  // scrolling into a topic opens its first answer; a tap overrides that until the next topic
  const open = picked?.at === at ? picked.q : items[0].q

  const jump = (i: number) => {
    const el = section.current
    if (el) scrollToY(el.offsetTop + faqTopicMid(i) * (el.offsetHeight - window.innerHeight))
  }

  return (
    <section ref={section} id="faq" className="relative h-[450svh]">
      <script type="application/ld+json">{jsonLd}</script>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] gap-6 px-5 pb-8 pt-24 md:grid-cols-[1fr_1.5fr] md:grid-rows-[auto] md:content-center md:items-start md:gap-16 md:px-8 md:pb-10 md:pt-28">
          <div>
            {/* the title with the ring beside it, the topics right under */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="display text-4xl text-ink md:text-6xl">Questions.</h2>
              <div ref={(el) => void (anchors.faqSlot = el)} aria-hidden className="size-20 shrink-0 md:size-32" />
            </div>
            {/* the topics, filling as you scroll */}
            <ol aria-label="FAQ topics" className="mt-6 flex gap-1.5 overflow-x-auto [scrollbar-width:none] md:mt-8 md:block md:space-y-1 md:overflow-visible">
              {faqTopics.map((t, i) => (
                <li key={t} className="shrink-0">
                  <button
                    type="button"
                    aria-current={i === at}
                    onClick={() => jump(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-full transition max-md:px-3.5 max-md:py-1.5 max-md:text-sm md:py-1.5 ${
                      i === at ? 'text-ink max-md:bg-ink max-md:text-white' : i < at ? 'text-ink max-md:bg-mist' : 'text-ash/60 max-md:bg-mist'
                    }`}
                  >
                    <span className="label-mono w-5 max-md:hidden">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`md:font-display md:text-2xl md:font-bold ${i === at ? '' : 'md:font-normal'}`}>{t}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="mt-6 h-0.5 w-full overflow-hidden rounded-full bg-mist max-md:hidden">
              <div className="h-full bg-violet" style={{ width: `${p * 100}%` }} />
            </div>
          </div>
          <ul key={topic} aria-label={topic} className="min-h-0 animate-[fade-up_0.4s_ease-out] border-t border-line md:mt-4 md:min-h-[26rem]">
            {items.map((f) => (
              <QA key={f.q} {...f} open={open === f.q} onToggle={() => setPicked({ at, q: open === f.q ? null : f.q })} className="border-b border-line" />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
