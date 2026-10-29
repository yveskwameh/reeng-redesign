import { useRef } from 'react'
import { Stage } from '../../hero-options/stage'
import { ModeRing, modes, Pulse, ResultCard, tapOf, useEco } from './shared'

/**
 * D — Rail and phone (after Heron's and Anchor's numbered rails beside one showcase). A
 * numbered list of the modes fills down a line as you scroll; beside it, the ring taps a
 * phone and the phone's screen shows what opens: a receipt, a profile, a pass.
 */
export function OptionRail() {
  const section = useRef<HTMLElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const { p, live, mode: i, local } = useEco(section)
  const mode = modes[i]
  const tapped = tapOf(local) > 0.6 || local > 0.3

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto grid h-full max-w-6xl grid-rows-[auto_1fr] gap-6 px-5 pb-6 pt-24 md:grid-cols-[1fr_1fr] md:grid-rows-1 md:items-center md:gap-12 md:px-8 md:pt-28">
          <div>
            <h2 className="display text-4xl text-ink md:text-6xl">One ring. More taps.</h2>
            {/* the rail */}
            <div className="relative mt-6 md:mt-10">
              <div className="absolute bottom-3 left-[0.6rem] top-3 w-px bg-line max-md:hidden" />
              <div className="absolute left-[0.6rem] top-3 w-px max-md:hidden" style={{ height: `calc(${p} * (100% - 1.5rem))`, background: mode.text }} />
              <ol className="flex gap-2 md:block md:space-y-6">
                {modes.map((m, k) => (
                  <li key={m.id} className={`relative transition max-md:flex-1 md:pl-10 ${k === i ? '' : 'opacity-40'}`}>
                    <span className="absolute left-0 top-0.5 flex size-5 items-center justify-center rounded-full bg-white ring-1 ring-line max-md:hidden" style={k <= i ? { background: m.text } : undefined}>
                      <span className="size-1.5 rounded-full bg-white" />
                    </span>
                    <p className={`label-mono max-md:rounded-full max-md:py-2 max-md:text-center ${k === i ? 'max-md:bg-mist' : ''}`} style={{ color: k === i ? m.text : undefined }}>
                      0{k + 1} · {m.name}
                    </p>
                    {k === i && (
                      <div className="max-md:hidden">
                        <p className="mt-2 text-lg text-ink/70">{m.body}</p>
                        {m.href ? (
                          <a href={m.href} target="_blank" rel="noreferrer" className="label-mono mt-2 inline-block underline underline-offset-4" style={{ color: m.text }}>
                            Visit {m.product} ↗
                          </a>
                        ) : (
                          <p className="label-mono mt-2 text-ash">You’re here</p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-ink/70 md:hidden">{mode.body}</p>
            </div>
          </div>

          {/* the phone, with the ring tapping its top */}
          <div className="relative flex min-h-0 items-end justify-center md:h-[78svh] md:items-center">
            <div className="relative aspect-[9/19] h-full max-h-[34rem] rounded-[2.6rem] bg-ink p-2 shadow-2xl shadow-ink/20 max-md:max-h-[52svh]">
              <div className="flex h-full flex-col overflow-hidden rounded-[2.1rem] bg-mist">
                <div className="mx-auto mt-2 h-5 w-20 rounded-full bg-ink" />
                <div className="flex flex-1 items-center justify-center p-3">
                  {tapped ? (
                    <ResultCard key={mode.id} mode={mode} className="w-full animate-[fade-up_0.4s_ease-out] text-[0.8em] shadow-none" />
                  ) : (
                    <p className="label-mono text-center text-ash">Hold near<br />the top</p>
                  )}
                </div>
              </div>
              <Pulse id={mode.id} color={mode.text} className="left-1/2 top-10" />
            </div>
            <div ref={slot} className="absolute left-1/2 top-0 h-28 w-28 -translate-y-1/3 translate-x-[10%] md:h-36 md:w-36" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <ModeRing slot={slot} progress={live} fill={1} toward={[-30, 50]} />
          </Stage>
        </div>
      </div>
    </section>
  )
}
