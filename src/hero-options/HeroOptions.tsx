import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { OptionCombined } from './OptionCombined'
import { OptionSpec } from './OptionSpec'
import { OptionStudio } from './OptionStudio'
import { OptionTap } from './OptionTap'
import { OptionWordmark } from './OptionWordmark'

const OPTIONS = [
  { id: 'e', name: 'Mix · A + B + D', nav: 'Floating icon pill', Hero: OptionCombined },
  { id: 'a', name: 'Wordmark', nav: 'Hairline bar', Hero: OptionWordmark },
  { id: 'b', name: 'Studio', nav: 'Floating icon pill', Hero: OptionStudio },
  { id: 'c', name: 'Spec sheet', nav: 'Mono brackets', Hero: OptionSpec },
  { id: 'd', name: 'Tap anywhere', nav: 'Menu overlay', Hero: OptionTap },
]

/**
 * Review page for the light-theme hero: /hero-options?v=a…e. Each option brings its
 * own nav. Not linked from the site; delete once a direction is chosen.
 */
export function HeroOptions() {
  const [params, setParams] = useSearchParams()
  const current = OPTIONS.find((o) => o.id === params.get('v')) ?? OPTIONS[0]
  const { Hero } = current

  useEffect(() => {
    document.body.style.background = '#ffffff'
    document.body.style.color = '#0a0a0f'
    return () => {
      document.body.style.background = ''
      document.body.style.color = ''
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [current.id])

  return (
    <div className="bg-white text-ink">
      <Hero key={current.id} />

      {/* stand-in for the next section, so the hero's scroll behaviour and the nav can be judged */}
      <section className="grid min-h-[80svh] place-items-center bg-mist px-6 text-center">
        <div>
          <p className="label-mono text-ash">Next section</p>
          <p className="display mt-3 text-3xl text-ink/30 md:text-5xl">Tap to pay</p>
        </div>
      </section>

      <div data-switcher className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-3">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-ink p-1.5 shadow-xl shadow-ink/20">
          <span className="label-mono hidden px-3 text-white/50 md:block">Hero</span>
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => setParams({ v: o.id })}
              title={`Nav: ${o.nav}`}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm transition ${
                o.id === current.id ? 'bg-white text-ink' : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="font-mono uppercase">{o.id}</span> · {o.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
