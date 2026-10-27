import type { ReactNode } from 'react'
import { SECURITY, secFeature } from '../scene/scrollState'

const ss = (a: number, b: number, x: number) => Math.min(1, Math.max(0, (x - a) / (b - a)))

/**
 * The Reeng app's security screen. Each feature is a row whose control sets itself as
 * scroll progress `p` reaches it — PIN switches on, the limit slides up, hours pick, revoke
 * fires, the chip seals. Phones show only the active row (below lg too with `compact`).
 */
export function SecurityControls({ p, className = '', compact, children }: { p: number; className?: string; compact?: boolean; children?: ReactNode }) {
  const active = secFeature(p)
  // how far each feature's control has animated (0 → 1 over the start of its stretch)
  const per = (1 - 0.15) / SECURITY.length
  const k = (i: number) => ss(0.15 + i * per, 0.15 + i * per + per * 0.45, p)
  const limit = Math.round(k(1) * 200)
  const revoked = k(3) > 0.5 && active === 3

  return (
    <div className={`w-full max-w-sm rounded-3xl bg-white p-2 shadow-xl shadow-ink/10 ring-1 ring-line ${className}`}>
      <p className="label-mono px-3 pb-1 pt-2 text-ash">Reeng app · Security</p>
      <Row i={0} compact={compact} active={active} title="PIN on every tap">
        <Toggle on={k(0) > 0.5} />
      </Row>
      <Row i={1} compact={compact} active={active} title="Spend limit" note={`$${limit} per tap`}>
        <div className="h-1.5 w-20 rounded-full bg-mist">
          <div className="h-1.5 rounded-full bg-violet" style={{ width: `${k(1) * 100}%` }} />
        </div>
      </Row>
      <Row i={2} compact={compact} active={active} title="Active hours" note={k(2) > 0.5 ? 'Mon–Fri · 08:00–22:00' : 'Always'}>
        <div className="flex gap-0.5">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, j) => (
            <span key={j} className={`grid size-5 place-items-center rounded-full text-[10px] transition ${j < 5 && k(2) > j / 7 ? 'bg-ink text-white' : 'bg-mist text-ash'}`}>
              {d}
            </span>
          ))}
        </div>
      </Row>
      <Row i={3} compact={compact} active={active} title={revoked ? 'Ring disabled' : 'Revoke ring'} danger>
        <span className={`rounded-full px-3 py-1 text-xs font-medium transition ${revoked ? 'bg-coral text-white' : 'bg-coral/10 text-ink'}`}>{revoked ? 'Off' : 'Revoke'}</span>
      </Row>
      <Row i={4} compact={compact} active={active} title="Secure chip" note="Keys never leave the ring">
        <span className={`label-mono rounded-full px-2.5 py-1 transition ${k(4) > 0.5 ? 'bg-ink text-white' : 'bg-mist text-ash'}`}>{k(4) > 0.5 ? 'Sealed' : '—'}</span>
      </Row>
      {children}
    </div>
  )
}

function Row({ i, active, compact, title, note, danger, children }: { i: number; active: number; compact?: boolean; title: string; note?: string; danger?: boolean; children: ReactNode }) {
  const on = i === active
  // phones: only the active row, to keep the card short
  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition ${on ? (danger ? 'bg-coral/10' : 'bg-mist') : ''} ${i > active ? 'opacity-40' : ''} ${i !== active ? (compact ? 'max-lg:hidden' : 'max-md:hidden') : ''}`}>
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {note && <p className="text-xs text-ash">{note}</p>}
      </div>
      {children}
    </div>
  )
}

const Toggle = ({ on }: { on: boolean }) => (
  <span className={`relative h-6 w-10 shrink-0 rounded-full transition ${on ? 'bg-violet' : 'bg-line'}`}>
    <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? 'left-[1.125rem]' : 'left-0.5'}`} />
  </span>
)
