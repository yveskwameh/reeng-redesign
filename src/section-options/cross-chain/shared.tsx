import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Euler, Quaternion, type Group, type Vector3 } from 'three'
import { Ring } from '../../scene/Ring'

const PORTAL = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)) // hole facing us
const FLAT = new Quaternion().setFromEuler(new Euler(0.62, 0, 0)) // lying flat, tipped toward us
const sway = new Quaternion()
const e = new Euler()

/** The ring as a gateway: facing the camera (`portal`) or lying flat for coins to drop through. */
export function GateRing({ pos, scale, flat }: { pos: Vector3; scale: number; flat?: boolean }) {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    g.position.set(pos.x, pos.y + Math.sin(t * 1.2) * 0.03, pos.z)
    if (flat) sway.setFromEuler(e.set(0, 0, Math.sin(t * 0.7) * 0.06))
    else sway.setFromEuler(e.set(0, Math.sin(t * 0.7) * 0.18, 0))
    g.quaternion.copy(sway).multiply(flat ? FLAT : PORTAL)
    g.scale.setScalar(scale)
  })
  return (
    <group ref={ref}>
      <Ring />
    </group>
  )
}

/** Balance card shared by the options (matches the hero / tap-to-pay receipts). */
export function BalanceCard({ amount, status, className = '' }: { amount: number; status: 'Receiving' | 'Bridging' | 'Settled on Base'; className?: string }) {
  const settled = status === 'Settled on Base'
  return (
    <div className={`w-72 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line ${className}`}>
      <div className="flex items-center justify-between">
        <p className="label-mono text-ash">Balance</p>
        <span
          className={`label-mono flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors duration-300 ${
            settled ? 'bg-lime text-ink' : 'bg-mist text-ash'
          }`}
        >
          <span className={`size-1.5 rounded-full ${settled ? 'bg-ink' : 'animate-pulse bg-violet'}`} />
          {status}
        </span>
      </div>
      <p className="mt-3 font-mono text-4xl tabular-nums text-ink">
        {amount.toFixed(2)}
        <span className="ml-2 text-base text-ash">USDC</span>
      </p>
    </div>
  )
}

export const Headline = () => (
  <h2 className="display text-5xl text-ink md:text-7xl">
    Any coin in. <span className="text-[#2775CA]">USDC</span> out.
  </h2>
)
export const Sub = () => <p className="mt-5 text-lg text-ash">Receive on any chain. Reeng bridges it all to USDC on Base.</p>
