import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Euler, MathUtils, MeshStandardMaterial, Quaternion, Vector3, type Group } from 'three'
import { COIN_OUT, coinEdge, coinGeometry, coinTexture, type CoinFace } from '../../scene/coinTexture'

const FACE_CAMERA = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0))
const CAP_UPRIGHT = Math.PI / 2
const Y = new Vector3(0, 1, 0)
const LIE_FLAT = new Quaternion().setFromEuler(new Euler(0.35, 0, 0)).multiply(new Quaternion().setFromAxisAngle(Y, CAP_UPRIGHT))
const a = new Vector3()
const b = new Vector3()
const q = new Quaternion()
const spin = new Quaternion()

export type Flight = {
  id: number
  face: CoinFace
  t0: number
  /** start, in px relative to the canvas, or already in world units */
  from: { px: number; py: number } | Vector3
  fromWorld?: Vector3
  landed?: boolean
}

/** Plain mutable store the DOM pushes flights into; the canvas reads it every frame. */
export function createFlights() {
  let next = 0
  return {
    list: [] as Flight[],
    send(face: CoinFace, from: Flight['from']) {
      this.list.push({ id: next++, face, from, t0: performance.now() / 1000 })
      if (this.list.length > 12) this.list.shift()
    },
  }
}
export type Flights = ReturnType<typeof createFlights>

const POOL = 12
const STACK = 8

/**
 * Coins flying through the ring: from wherever they were sent → into the ring → out the
 * other side as USDC on Base → onto a stack (or fading away when there is no stack).
 * `axis` is the direction they pass through: 'z' for a portal facing the camera,
 * 'y' for a ring lying flat that coins drop through.
 */
export function FlightCoins({
  store,
  ring,
  axis = 'z',
  stack,
  duration = 1.6,
  onLand,
}: {
  store: Flights
  ring: Vector3
  axis?: 'z' | 'y'
  stack?: Vector3
  duration?: number
  onLand?: (f: Flight) => void
}) {
  const coins = useRef<(Group | null)[]>([])
  const { size, viewport } = useThree()
  const mats = useMemo(
    () => Array.from({ length: POOL }, () => new MeshStandardMaterial({ metalness: 0.35, roughness: 0.35, transparent: true })),
    [],
  )

  useFrame((state, dt) => {
    const now = performance.now() / 1000
    const t = state.clock.elapsedTime
    coins.current.forEach((g) => g && (g.visible = false))
    const landedOrder = store.list.filter((f) => f.landed)

    for (const f of store.list) {
      const g = coins.current[f.id % POOL]
      if (!g) continue
      if (!f.fromWorld) {
        f.fromWorld =
          f.from instanceof Vector3
            ? f.from.clone()
            : new Vector3((f.from.px / size.width - 0.5) * viewport.width, -(f.from.py / size.height - 0.5) * viewport.height, 0)
      }
      const u = Math.min(1, (now - f.t0) / duration)
      const entry = axis === 'z' ? a.set(ring.x, ring.y, -0.8) : a.set(ring.x, ring.y + 0.75, 0)
      const exit = axis === 'z' ? b.set(ring.x, ring.y, 0.8) : b.set(ring.x, ring.y - 0.75, 0)
      let opacity = 1
      if (u < 0.4) g.position.lerpVectors(f.fromWorld, entry, MathUtils.smoothstep(u, 0, 0.4))
      else if (u < 0.6) g.position.lerpVectors(entry, exit, MathUtils.smoothstep(u, 0.4, 0.6))
      else if (stack) {
        const slot = Math.max(0, landedOrder.indexOf(f)) % STACK
        a.set(stack.x, stack.y + (f.landed ? slot : landedOrder.length % STACK) * 0.045, stack.z)
        g.position.lerpVectors(exit, a, MathUtils.smoothstep(u, 0.6, 1))
      } else {
        a.copy(exit).y -= 0.9
        g.position.lerpVectors(exit, a, MathUtils.smoothstep(u, 0.6, 1))
        opacity = 1 - MathUtils.smoothstep(u, 0.75, 1)
      }
      if (u >= 1 && !f.landed) {
        f.landed = true
        onLand?.(f)
      }
      if (!stack && u >= 1) continue

      const wobble = Math.sin(t * 1.3 + f.id * 1.7) * 0.35 * (1 - MathUtils.smoothstep(u, 0.6, 1))
      spin.setFromAxisAngle(Y, CAP_UPRIGHT + wobble)
      q.copy(FACE_CAMERA).multiply(spin)
      if (stack) q.slerp(LIE_FLAT, MathUtils.smoothstep(u, 0.7, 1))
      g.quaternion.slerp(q, u < 0.02 ? 1 : 1 - Math.exp(-dt * 12))
      g.visible = true
      const m = mats[f.id % POOL]
      const tex = coinTexture(u >= 0.5 ? COIN_OUT : f.face)
      if (m.map !== tex) {
        m.map = tex
        m.needsUpdate = true
      }
      m.opacity = opacity
    }
  })

  return (
    <>
      {mats.map((m, i) => (
        <group key={i} ref={(g) => void (coins.current[i] = g)} visible={false}>
          <mesh geometry={coinGeometry} material={[coinEdge, m, m]} />
        </group>
      ))}
    </>
  )
}
