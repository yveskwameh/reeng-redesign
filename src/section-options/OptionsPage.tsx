import { useEffect, type ComponentType } from 'react'
import { useSearchParams } from 'react-router'
import { Nav } from '../components/Nav'

export type SectionOption = { id: string; name: string; note: string; Section: ComponentType }

/**
 * Review page for one section's layout options: /options/<section>?v=a…  Shows the real
 * nav, a stand-in for the sections either side, and a switcher. Not linked from the site.
 */
export function OptionsPage({ title, before, after, options }: { title: string; before: string; after: string; options: SectionOption[] }) {
  const [params, setParams] = useSearchParams()
  const current = options.find((o) => o.id === params.get('v')) ?? options[0]
  const { Section } = current

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [current.id])

  return (
    <div className="bg-white text-ink">
      <Nav />
      <Placeholder label={`Previous section · ${before}`} />
      <Section key={current.id} />
      <Placeholder label={`Next section · ${after}`} />

      <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-3">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-ink p-1.5 shadow-xl shadow-ink/20">
          <span className="label-mono hidden shrink-0 px-3 text-white/50 md:block">{title}</span>
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => setParams({ v: o.id })}
              title={o.note}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm transition ${o.id === current.id ? 'bg-white text-ink' : 'text-white/70 hover:text-white'}`}
            >
              <span className="font-mono uppercase">{o.id}</span> · {o.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="grid h-[40svh] place-items-center bg-mist">
      <p className="label-mono text-ash">{label}</p>
    </div>
  )
}
