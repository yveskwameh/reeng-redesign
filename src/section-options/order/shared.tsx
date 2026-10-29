import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three'
import { innerDiameter } from '../../content/sizing'
import { Ring } from '../../scene/Ring'

export * from '../../components/order'

const HERO = new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35))
const SIDE = new Quaternion().setFromEuler(new Euler(0.2, 0, Math.PI / 2))
const spinQ = new Quaternion()
const rot = new Quaternion()
const Y = new Vector3(0, 1, 0)

/**
 * The configurator ring: takes the picked finish, grows to scale with the picked size (US 9
 * = `scale`), turns in from its side as the section scrolls in (`enter`), and can be dragged
 * to spin anywhere over `area`, with inertia.
 */
export function OrderRing({
  finish,
  size,
  at,
  scale,
  enter,
  area,
}: {
  finish: string
  size: number
  at: RefObject<Vector3>
  scale: number
  enter: RefObject<number>
  area: RefObject<HTMLElement | null>
}) {
  const g = useRef<Group>(null)
  const drag = useRef({ on: false, x: 0, vel: 0, spin: 0 })

  useEffect(() => {
    const el = area.current
    if (!el) return
    const d = drag.current
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a,button,input,label,[role=dialog]')) return
      d.on = true
      d.x = e.clientX
    }
    const move = (e: PointerEvent) => {
      if (!d.on) return
      d.vel = (e.clientX - d.x) * 0.01
      d.spin += d.vel
      d.x = e.clientX
    }
    const up = () => void (d.on = false)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [area])

  useFrame((state, dt) => {
    const r = g.current
    if (!r) return
    const d = drag.current
    if (!d.on) {
      d.vel *= Math.exp(-dt * 3)
      d.spin += d.vel + dt * 0.25
    }
    const k = MathUtils.smoothstep(enter.current, 0, 1)
    r.position.lerp(at.current, 1 - Math.exp(-dt * 8))
    r.position.y += Math.sin(state.clock.elapsedTime * 1.2) * 0.002
    spinQ.setFromAxisAngle(Y, d.spin)
    rot.copy(SIDE).slerp(HERO, k).multiply(spinQ)
    r.quaternion.slerp(rot, 1 - Math.exp(-dt * 10))
    // true to scale between sizes, relative to the US 9 it's modelled at
    const fit = innerDiameter(size) / innerDiameter(9)
    r.scale.setScalar(MathUtils.damp(r.scale.x || scale, scale * fit, 8, dt))
  })

  return (
    <group ref={g}>
      <Ring finish={finish} />
    </group>
  )
}

/** 0 → 1 as the section's top travels from the bottom of the screen to the top (its entrance). */
export function useEnter(section: RefObject<HTMLElement | null>) {
  const enter = useRef(0)
  useEffect(() => {
    const update = () => {
      const r = section.current?.getBoundingClientRect()
      if (r) enter.current = MathUtils.clamp(1 - r.top / window.innerHeight, 0, 1)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [section])
  return enter
}
