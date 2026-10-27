import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Euler, MathUtils, MeshStandardMaterial, Quaternion, Vector3, type Group } from 'three'
import { Stage } from '../../hero-options/stage'
import { COIN_OUT, coinEdge, coinGeometry, coinTexture } from '../../scene/coinTexture'
import { CHAINS, COIN_VALUE } from '../../content/chains'
import { ChainDot } from '../../components/ChainDot'
import { GateRing, Headline, Sub } from './shared'

const COINS = 6
const FACE_CAMERA = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)).multiply(new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0)))
const RING = new Vector3(0, 0, 0)
const q = new Quaternion()
const e = new Euler()

/** Coin i's journey within the pinned scroll: out of the depth, through the ring at the midpoint. */
const window_ = (i: number) => [0.08 + i * 0.13, 0.08 + i * 0.13 + 0.22] as const
const travel = (i: number, p: number) => MathUtils.clamp((p - window_(i)[0]) / (window_(i)[1] - window_(i)[0]), 0, 1)

/**
 * D — Tunnel (after the coin-tunnel shots on Dribbble / Pinterest). Scroll-driven: the ring
 * hangs face-on in the middle of a faint tunnel; coins from each chain rush out of the depth
 * through it, turning into USDC as they pass, and each one writes a line in the ledger.
 */
export function OptionTunnel() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [passed, setPassed] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = section.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const p = MathUtils.clamp(-r.top / (r.height - window.innerHeight), 0, 1)
      progress.current = p
      let n = 0
      for (let i = 0; i < COINS; i++) if (travel(i, p) >= 0.55) n++
      setPassed(n)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <TunnelScene progress={progress} />
        </Stage>

        <div className="pointer-events-none absolute inset-0 mx-auto grid max-w-7xl content-between gap-6 px-5 pb-10 pt-28 md:grid-cols-[1fr_auto] md:items-end md:px-8">
          <div className="max-w-sm self-start">
            <Headline />
            <Sub />
          </div>

          {/* ledger: one line per coin that has come through */}
          <div className="w-full rounded-3xl bg-white/85 p-4 shadow-sm ring-1 ring-line backdrop-blur md:w-80">
            <p className="label-mono flex justify-between text-ash">
              <span>Incoming</span>
              <span>→ USDC · Base</span>
            </p>
            <ul className="mt-3 space-y-1">
              {Array.from({ length: COINS }, (_, i) => {
                const c = CHAINS[i]
                const done = i < passed
                return (
                  <li
                    key={i}
                    className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all duration-300 max-md:[&:nth-child(n+4)]:hidden ${done ? 'opacity-100' : 'opacity-25'}`}
                  >
                    <ChainDot chain={c} className="size-6 text-[10px]" />
                    <span className="flex-1 text-sm text-ink">
                      {c.ticker} <span className="text-ash">· {c.name}</span>
                    </span>
                    <span className="font-mono text-sm tabular-nums text-ink">{done ? `+${COIN_VALUE.toFixed(2)}` : '—'}</span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
              <span className="label-mono text-ash">{passed === COINS ? 'Settled on Base' : 'Bridging'}</span>
              <span className="font-mono text-2xl tabular-nums text-ink">{(passed * COIN_VALUE).toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function TunnelScene({ progress }: { progress: React.RefObject<number> }) {
  const coins = useRef<(Group | null)[]>([])
  const { viewport } = useThree()
  const mats = useMemo(() => Array.from({ length: COINS }, (_, i) => new MeshStandardMaterial({ map: coinTexture(CHAINS[i]), metalness: 0.35, roughness: 0.35 })), [])
  const scale = viewport.aspect < 1 ? 0.5 : 0.62

  useFrame((state) => {
    const p = progress.current
    const t = state.clock.elapsedTime
    coins.current.forEach((g, i) => {
      if (!g) return
      const u = travel(i, p)
      g.visible = u > 0 && u < 1
      // spiral in from far behind, pass the ring at u = 0.5, sweep off toward the ledger
      const a = i * 2.1 + u * 3
      const r = (1 - MathUtils.smoothstep(u, 0, 0.5)) * 1.4
      const z = MathUtils.lerp(-16, 0, MathUtils.smoothstep(u, 0, 0.5)) + MathUtils.smoothstep(u, 0.5, 1) * 1.2
      const off = MathUtils.smoothstep(u, 0.55, 1)
      g.position.set(Math.cos(a) * r + off * viewport.width * 0.32, Math.sin(a) * r * 0.7 - off * viewport.height * 0.25, z)
      e.set(Math.sin(t + i) * 0.25, Math.sin(t * 0.7 + i) * 0.3, 0)
      q.setFromEuler(e).multiply(FACE_CAMERA)
      g.quaternion.copy(q)
      g.scale.setScalar(1.6 * scale)
      const tex = coinTexture(u >= 0.5 ? COIN_OUT : CHAINS[i])
      const m = mats[i]
      if (m.map !== tex) {
        m.map = tex
        m.needsUpdate = true
      }
    })
  })

  return (
    <>
      <GateRing pos={RING} scale={scale} />
      {/* faint tunnel rings receding behind the gate */}
      {[3, 6, 9, 12].map((d) => (
        <mesh key={d} position={[0, 0, -d]}>
          <ringGeometry args={[1.25 * scale * 1.6, 1.25 * scale * 1.6 + 0.04, 96]} />
          <meshBasicMaterial color="#d9d7e2" transparent opacity={0.9 - d * 0.05} />
        </mesh>
      ))}
      {mats.map((m, i) => (
        <group key={i} ref={(g) => void (coins.current[i] = g)} visible={false}>
          <mesh geometry={coinGeometry} material={[coinEdge, m, m]} />
        </group>
      ))}
    </>
  )
}
