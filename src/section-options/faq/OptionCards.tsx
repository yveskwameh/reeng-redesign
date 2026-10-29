import { useState } from 'react'
import { byTopic, Chips, faq, QA, type Topic } from './shared'

/**
 * C — Cards (after Lassie's and Relume's card lists). A soft grey band with a centred title
 * and topic chips (with counts); each question is its own white card in two columns, and
 * the open one lifts. No 3D.
 */
export function OptionCards() {
  const [topic, setTopic] = useState<Topic>('All')
  const [open, setOpen] = useState<string | null>(faq[0].q)
  const items = byTopic(topic)
  const half = Math.ceil(items.length / 2)

  return (
    <section className="px-3 py-10 md:px-6 md:py-16">
      <div className="rounded-[2.5rem] bg-mist px-4 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="display text-center text-4xl text-ink md:text-6xl">Questions.</h2>
          <Chips counts className="mt-6 justify-center [&>button:not([aria-selected=true])]:bg-white" value={topic} onChange={(t) => (setTopic(t), setOpen(byTopic(t)[0].q))} />
          <div className="mt-10 grid items-start gap-3 md:grid-cols-2">
            {[items.slice(0, half), items.slice(half)].map((col, c) => (
              <ul key={c} className="space-y-3">
                {col.map((f) => (
                  <QA
                    key={f.q}
                    {...f}
                    open={open === f.q}
                    onToggle={() => setOpen(open === f.q ? null : f.q)}
                    className={`rounded-2xl bg-white px-5 transition-shadow duration-300 ${open === f.q ? 'shadow-xl shadow-ink/5' : ''}`}
                    rowClassName="py-4"
                  />
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
