import { useRef, useState } from 'react'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { faq, faqTopics, QA, TopicRing, type Topic } from './shared'

const N = faqTopics.length

/**
 * D — Scroll through topics (like Ecosystem, one topic per stop). The section holds while
 * you scroll Setup → Payments → Security → Hardware → Orders; a numbered rail fills, the
 * topic's first answer opens on its own, and the ring turns to the topic's pose. Tap a
 * topic to jump to it, or any question to open it.
 */
export function OptionScroll() {
  const section = useRef<HTMLElement>(null)
  // a small spot beside the title on phones, a bigger one under the rail otherwise
  const small = useRef<HTMLDivElement>(null)
  const big = useRef<HTMLDivElement>(null)
  const slot = useRef({
    get current() {
      return small.current?.offsetWidth ? small.current : big.current
    },
  }).current
  const [p, setP] = useState(0)
  const [picked, setPicked] = useState<{ at: number; q: string | null } | null>(null)
  useSectionProgress(section, setP)
  const at = Math.min(N - 1, Math.floor(p * N))
  const topic = faqTopics[at]
  const pose = useRef<Topic>(topic)
  pose.current = topic
  const items = faq.filter((f) => f.topic === topic)
  // scrolling into a topic opens its first answer; a tap overrides that until the next topic
  const open = picked?.at === at ? picked.q : items[0].q

  const jump = (i: number) => {
    const el = section.current
    if (el) window.scrollTo({ top: el.offsetTop + ((i + 0.5) / N) * (el.offsetHeight - window.innerHeight), behavior: 'smooth' })
  }

  return (
    <section ref={section} className="relative h-[450svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] gap-6 px-5 pb-20 pt-24 md:grid-cols-[1fr_1.5fr] md:grid-rows-1 md:gap-16 md:px-8 md:pt-28">
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <h2 className="display text-4xl text-ink md:text-6xl">Questions.</h2>
              <div ref={small} aria-hidden className="size-20 shrink-0 md:hidden" />
            </div>
            {/* the topics, filling as you scroll */}
            <ol className="mt-6 flex gap-1.5 overflow-x-auto [scrollbar-width:none] md:mt-10 md:block md:space-y-1 md:overflow-visible">
              {faqTopics.map((t, i) => (
                <li key={t} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-full transition max-md:px-3.5 max-md:py-1.5 max-md:text-sm md:py-1.5 ${
                      i === at ? 'text-ink max-md:bg-ink max-md:text-white' : i < at ? 'text-ink max-md:bg-mist' : 'text-ash/60 max-md:bg-mist'
                    }`}
                  >
                    <span className="label-mono w-5 max-md:hidden">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`md:text-2xl md:font-display md:font-bold ${i === at ? '' : 'md:font-normal'}`}>{t}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="mt-6 h-0.5 w-full overflow-hidden rounded-full bg-mist max-md:hidden">
              <div className="h-full bg-violet" style={{ width: `${p * 100}%` }} />
            </div>
            <div ref={big} aria-hidden className="mt-auto aspect-square w-48 max-md:hidden" />
          </div>
          <ul key={topic} className="min-h-0 animate-[fade-up_0.4s_ease-out] self-center border-t border-line max-md:self-start">
            {items.map((f) => (
              <QA key={f.q} {...f} open={open === f.q} onToggle={() => setPicked({ at, q: open === f.q ? null : f.q })} className="border-b border-line" />
            ))}
          </ul>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <Stage passive>
            <TopicRing slot={slot} topic={pose} fill={0.8} />
          </Stage>
        </div>
      </div>
    </section>
  )
}
