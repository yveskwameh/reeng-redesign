import type { Mode } from '../content/ecosystem'

/** Contactless rings spreading from a point in the mode's colour; restarts when `id` changes. */
export function Pulse({ id, color, className = '' }: { id: string; color: string; className?: string }) {
  return (
    <div key={id} aria-hidden className={`pointer-events-none absolute ${className}`}>
      {[0, 0.18, 0.36].map((d) => (
        <span
          key={d}
          className="absolute left-0 top-0 size-24 rounded-full border-2 opacity-0 animate-[ripple_1.2s_ease-out_both]"
          style={{ borderColor: color, animationDelay: `${0.25 + d}s` }}
        />
      ))}
    </div>
  )
}

/** What the other side sees after a tap, as a light card: a receipt, a profile, a pass. Sample data is fictional. */
export function ResultCard({ mode, className = '' }: { mode: Mode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-3xl bg-white shadow-xl shadow-ink/10 ring-1 ring-line ${className}`}>
      <div className="p-5">
        <p className="label-mono" style={{ color: mode.text }}>
          {mode.product}
        </p>
        {mode.id === 'pay' && (
          <>
            <p className="display mt-4 text-3xl" style={{ color: mode.text }}>
              Paid
            </p>
            <p className="display mt-3 text-5xl text-ink">50.00</p>
            <p className="label-mono mt-1 text-ash">USDC · Base</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="font-medium text-ink">Corner Café</p>
              <p className="label-mono mt-1 text-ash">09:41 · 0.8 s</p>
            </div>
          </>
        )}
        {mode.id === 'id' && (
          <>
            <div className="mt-4 flex size-14 items-center justify-center rounded-full font-display text-lg font-bold text-white" style={{ background: mode.text }}>
              AM
            </div>
            <p className="display mt-3 text-2xl text-ink">Ada Mensah</p>
            <p className="text-sm text-ash">Product Lead · Accra</p>
            <div className="mt-4 space-y-2">
              {['LinkedIn', 'Portfolio'].map((l) => (
                <p key={l} className="rounded-full bg-mist px-4 py-2 text-sm text-ink">
                  {l}
                </p>
              ))}
              <p className="rounded-full px-4 py-2 text-center text-sm font-medium text-white" style={{ background: mode.text }}>
                Save contact
              </p>
            </div>
          </>
        )}
        {mode.id === 'events' && (
          <>
            <p className="display mt-4 text-3xl" style={{ color: mode.text }}>
              Checked in
            </p>
            <p className="display mt-3 text-2xl text-ink">Base Builders</p>
            <p className="text-sm text-ash">Summit · Day 2</p>
            <div className="mt-5 space-y-2 border-t border-dashed border-line pt-4">
              {[
                ['Door', 'B · 09:41'],
                ['Guest', 'Ada Mensah'],
                ['Pass', 'Speaker'],
              ].map(([k, v]) => (
                <p key={k} className="flex justify-between">
                  <span className="label-mono text-ash">{k}</span>
                  <span className="text-sm text-ink">{v}</span>
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** The mode's copy and link, as in the current section. */
export function ModeCopy({ mode, className = '' }: { mode: Mode; className?: string }) {
  return (
    <div key={mode.id} className={`animate-[fade-up_0.4s_ease-out] ${className}`}>
      <p className="label-mono" style={{ color: mode.text }}>
        {mode.product}
      </p>
      <p className="mt-2 text-lg text-ink/70">{mode.body}</p>
      {mode.href ? (
        <a href={mode.href} target="_blank" rel="noreferrer" className="label-mono mt-3 inline-block underline underline-offset-4" style={{ color: mode.text }}>
          Visit {mode.product} ↗
        </a>
      ) : (
        <p className="label-mono mt-3 text-ash">You’re here</p>
      )}
    </div>
  )
}

/** Tints for a mode's stage: its colour very pale. */
export const wash = (mode: Mode, a = 0.08) => `color-mix(in srgb, ${mode.text} ${a * 100}%, white)`
