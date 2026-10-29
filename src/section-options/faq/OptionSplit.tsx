import { useRef, useState } from 'react'
import { Stage } from '../../hero-options/stage'
import { byTopic, Chips, faq, QA, TopicRing, type Topic } from './shared'

/**
 * A — Split with the ring (after Farm Minerals' and Teak's title-left lists, and KÖPPEN's
 * product panel). The title, topic chips and a stage card with the ring stay put on the left;
 * the questions run down the right. The ring turns to a pose for the open question's topic:
 * flat for payments, face-on for security, side-on for hardware.
 */
export function OptionSplit() {
  const [topic, setTopic] = useState<Topic>('All')
  const [open, setOpen] = useState<string | null>(faq[0].q)
  const slot = useRef<HTMLDivElement>(null)
  const pose = useRef<Topic>('Setup')
  pose.current = faq.find((f) => f.q === open)?.topic ?? (topic === 'All' ? 'Setup' : topic)
  const items = byTopic(topic)

  return (
    <section className="relative px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <div className="md:sticky md:top-28 md:self-start">
          <h2 className="display text-4xl text-ink md:text-6xl">Questions.</h2>
          <Chips className="mt-6" value={topic} onChange={(t) => (setTopic(t), setOpen(byTopic(t)[0].q))} />
          <div ref={slot} aria-hidden className="mt-8 aspect-[4/3] w-full rounded-3xl bg-mist max-md:hidden" />
          <p className="label-mono mt-3 text-ash max-md:hidden">{pose.current}</p>
        </div>
        <ul className="border-t border-line">
          {items.map((f) => (
            <QA key={f.q} {...f} open={open === f.q} onToggle={() => setOpen(open === f.q ? null : f.q)} className="border-b border-line" />
          ))}
        </ul>
      </div>
      <div className="pointer-events-none absolute inset-0 max-md:hidden">
        <Stage passive>
          <TopicRing slot={slot} topic={pose} fill={0.55} />
        </Stage>
      </div>
    </section>
  )
}
