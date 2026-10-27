import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Euler, MathUtils, MeshStandardMaterial, Quaternion, Vector3, type Group } from 'three'
import { Stage } from '../../hero-options/stage'
import { coinEdge, coinGeometry, coinTexture } from '../../scene/coinTexture'
import { CHAINS, COIN_VALUE } from '../../content/chains'
import { createFlights, FlightCoins, type Flights } from './Flights'
import { BalanceCard, GateRing, Headline, Sub } from './shared'

const FACE_CAMERA = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)).multiply(new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0)))
const COUNT = 9
// loose cloud around the ring, in units of half the viewport (x) / height (y)
const HOMES = [
  [-0.18, 0.55],
  [0.05, -0.62],
  [0.32, 0.72],
  [0.86, 0.5],
  [0.9, -0.25],
  [0.42, -0.78],
  [0.0, 0.3],
  [0.22, -0.2],
  [0.75, 0.08],
] as const
const v = new Vector3()
const q = new Quaternion()
const e = new Euler()

/** Shared between the DOM pointer handlers and the scene. */
type Drag = { index: number; x: number; y: number; sent: number[] }

/**
 * C — Drop it in (after Jeton's floating flags). Coins from every chain float around the
 * ring. Drag one into the ring — or just tap it — and it goes through, flips to USDC and
 * lands on the stack. Missed? It drifts back. Spent coins come back after a moment.
 */
export function OptionDropIn() {
  const [landed, setLanded] = useState(0)
  const [flying, setFlying] = useState(0)
  const section = useRef<HTMLDivElement>(null)
  const store = useMemo(() => createFlights(), [])
  const drag = useRef<Drag>({ index: -1, x: 0, y: 0, sent: Array(COUNT).fill(-10) })
  const scene = useRef<{ pick: (x: number, y: number) => number; release: (x: number, y: number) => void } | null>(null)

  useEffect(() => {
    const el = section.current
    if (!el) return
    let start = { x: 0, y: 0 }
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const down = (e: PointerEvent) => {
      const p = local(e)
      const i = scene.current?.pick(p.x, p.y) ?? -1
      if (i < 0) return
      start = p
      Object.assign(drag.current, { index: i, ...p })
      el.setPointerCapture(e.pointerId)
      e.preventDefault()
    }
    const move = (e: PointerEvent) => {
      if (drag.current.index < 0) return
      Object.assign(drag.current, local(e))
    }
    const up = (e: PointerEvent) => {
      if (drag.current.index < 0) return
      const p = local(e)
      // a tap counts as "send it"
      const tapped = Math.hypot(p.x - start.x, p.y - start.y) < 6
      scene.current?.release(tapped ? -1 : p.x, tapped ? -1 : p.y)
      drag.current.index = -1
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
    }
  }, [])

  const status = flying > landed ? 'Bridging' : landed > 0 ? 'Settled on Base' : 'Receiving'

  return (
    <section ref={section} className="relative h-svh min-h-[640px] touch-pan-y select-none overflow-hidden">
      <Stage>
        <DropScene
          store={store}
          drag={drag}
          api={scene}
          onSend={() => setFlying((n) => n + 1)}
          onLand={() => setLanded((n) => n + 1)}
        />
      </Stage>
      <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col justify-between px-5 pb-10 pt-28 md:px-8">
        <div className="max-w-md">
          <Headline />
          <Sub />
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <BalanceCard amount={landed * COIN_VALUE} status={status} />
          <p className="label-mono text-ash">Drag a coin into the ring — or tap one</p>
        </div>
      </div>
    </section>
  )
}

function DropScene({
  store,
  drag,
  api,
  onSend,
  onLand,
}: {
  store: Flights
  drag: React.RefObject<Drag>
  api: React.RefObject<{ pick: (x: number, y: number) => number; release: (x: number, y: number) => void } | null>
  onSend: () => void
  onLand: () => void
}) {
  const { viewport, size, camera } = useThree()
  const coins = useRef<(Group | null)[]>([])
  const hw = viewport.width / 2
  const hh = viewport.height / 2
  const portrait = viewport.aspect < 1
  const ring = useMemo(() => new Vector3(portrait ? 0 : hw * 0.3, portrait ? -0.2 : 0.1, 0), [hw, portrait])
  const stack = useMemo(() => new Vector3(portrait ? hw * 0.55 : hw * 0.88, -hh * 0.55, 0.4), [hw, hh, portrait])
  const mats = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => new MeshStandardMaterial({ map: coinTexture(CHAINS[i % CHAINS.length]), metalness: 0.35, roughness: 0.35 })),
    [],
  )
  const homes = useMemo(
    () => HOMES.map(([x, y]) => new Vector3(portrait ? x * hw * 0.9 - hw * 0.1 : x * hw, portrait ? y * hh * 0.55 - 0.2 : y * hh * 0.8, 0)),
    [hw, hh, portrait],
  )

  const toScreen = (p: Vector3) => {
    v.copy(p).project(camera)
    return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height }
  }
  const toWorld = (x: number, y: number) => new Vector3((x / size.width - 0.5) * viewport.width, -(y / size.height - 0.5) * viewport.height, 0)
  const now = () => performance.now() / 1000
  const hidden = (i: number) => now() - drag.current.sent[i] < 3

  // eslint-disable-next-line react-hooks/immutability
  api.current = {
    pick(x, y) {
      let best = -1
      let bestD = 48
      coins.current.forEach((g, i) => {
        if (!g || hidden(i)) return
        const s = toScreen(g.position)
        const d = Math.hypot(s.x - x, s.y - y)
        if (d < bestD) {
          best = i
          bestD = d
        }
      })
      return best
    },
    release(x, y) {
      const i = drag.current.index
      const g = coins.current[i]
      if (!g) return
      const r = toScreen(ring)
      // tapped (x < 0) or dropped close enough to the ring: send it through
      if (x < 0 || Math.hypot(x - r.x, y - r.y) < size.height * 0.16) {
        drag.current.sent[i] = now()
        store.send(CHAINS[i % CHAINS.length], g.position.clone())
        onSend()
      }
    },
  }

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    coins.current.forEach((g, i) => {
      if (!g) return
      const away = now() - drag.current.sent[i]
      // reappear softly at home a few seconds after being sent
      const back = MathUtils.smoothstep(away, 3, 3.6)
      g.visible = away >= 3
      if (drag.current.index === i) {
        g.position.lerp(toWorld(drag.current.x, drag.current.y).setZ(0.5), 1 - Math.exp(-dt * 20))
      } else {
        v.copy(homes[i])
        v.y += Math.sin(t * 0.9 + i * 1.3) * 0.08
        v.x += Math.cos(t * 0.6 + i) * 0.05
        g.position.lerp(v, away < 3.05 ? 1 : 1 - Math.exp(-dt * 4))
      }
      e.set(Math.sin(t * 0.8 + i) * 0.3, Math.sin(t * 0.5 + i * 2) * 0.4, 0)
      q.setFromEuler(e).multiply(FACE_CAMERA)
      g.quaternion.slerp(q, 1 - Math.exp(-dt * 6))
      g.scale.setScalar((drag.current.index === i ? 1.25 : 1) * (0.4 + 0.6 * back) * (portrait ? 0.8 : 1))
    })
  })

  return (
    <>
      <GateRing pos={ring} scale={portrait ? 0.38 : 0.55} />
      {mats.map((m, i) => (
        <group key={i} ref={(g) => void (coins.current[i] = g)}>
          <mesh geometry={coinGeometry} material={[coinEdge, m, m]} />
        </group>
      ))}
      <FlightCoins store={store} ring={ring} stack={stack} onLand={onLand} />
    </>
  )
}
