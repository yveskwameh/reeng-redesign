import { useState } from 'react'
import { faq, faqTopics, type FaqTopic } from '../content/faq'

// FAQPage structured data, so answers can show up directly in search results
const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})

/** The one text-heavy section: topic filters + an accordion. */
export function Faq() {
  const [topic, setTopic] = useState<FaqTopic | 'All'>('All')
  const [open, setOpen] = useState<string | null>(faq[0].q)
  const items = topic === 'All' ? faq : faq.filter((f) => f.topic === topic)

  return (
    <section id="faq" className="relative px-6 py-28 md:py-36">
      <script type="application/ld+json">{jsonLd}</script>
      <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="label-mono text-violet-glow">10 / FAQ</p>
          <h2 className="display mt-4 text-5xl md:text-7xl">Questions.</h2>
          <div role="tablist" aria-label="FAQ topics" className="mt-8 flex flex-wrap gap-2">
            {(['All', ...faqTopics] as const).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={t === topic}
                onClick={() => setTopic(t)}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition ${
                  t === topic ? 'border-violet-glow bg-violet/20 text-paper' : 'border-white/10 text-steel hover:border-white/30'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <ul role="tabpanel" className="border-t border-white/10">
          {items.map((f) => {
            const isOpen = open === f.q
            const id = `faq-${faq.indexOf(f)}`
            return (
              <li key={f.q} className="border-b border-white/10">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={id}
                    onClick={() => setOpen(isOpen ? null : f.q)}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-lg text-paper"
                  >
                    {f.q}
                    <span
                      aria-hidden
                      className={`text-2xl leading-none text-violet-glow transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={id}
                  className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <p className="overflow-hidden text-steel">{f.a}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
