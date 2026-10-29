import { useState } from 'react'
import { faq, faqTopics, QA } from './shared'

/**
 * B — Grouped by topic (after YLLW's and Zendesk's sectioned lists). No filter: every topic
 * gets its own row, its name big on the left (sticking while you read its questions) with a
 * count, the questions on the right. Quiet and easy to scan; no 3D.
 */
export function OptionGrouped() {
  const [open, setOpen] = useState<string | null>(faq[0].q)

  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <h2 className="display text-4xl text-ink md:text-6xl">Questions.</h2>
        <div className="mt-10 md:mt-14">
          {faqTopics.map((t) => {
            const items = faq.filter((f) => f.topic === t)
            return (
              <div key={t} className="grid gap-2 border-t border-ink py-6 md:grid-cols-[1fr_2fr] md:gap-12 md:py-8">
                <div className="md:sticky md:top-28 md:self-start">
                  <h3 className="display text-2xl text-ink md:text-3xl">{t}</h3>
                  <p className="label-mono mt-1 text-ash">{String(items.length).padStart(2, '0')} questions</p>
                </div>
                <ul>
                  {items.map((f, k) => (
                    <QA
                      key={f.q}
                      {...f}
                      open={open === f.q}
                      onToggle={() => setOpen(open === f.q ? null : f.q)}
                      className={k ? 'border-t border-line' : ''}
                      rowClassName="py-4"
                    />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
