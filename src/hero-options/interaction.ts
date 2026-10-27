import { useEffect, useRef, type RefObject } from 'react'

/** Pointer position over the viewport, -1…1 (y up). Read in useFrame. */
export const pointer = { x: 0, y: 0, clientX: 0, clientY: 0 }
window.addEventListener(
  'pointermove',
  (e) => {
    pointer.clientX = e.clientX
    pointer.clientY = e.clientY
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
  },
  { passive: true },
)

/**
 * Horizontal drag-to-spin with inertia on `target`. `angle` is the accumulated spin
 * (radians); call `step(dt)` once per frame.
 */
export function useDragSpin(target: RefObject<HTMLElement | null>) {
  const s = useRef({
    active: false,
    lastX: 0,
    lastMove: 0,
    vel: 0,
    angle: 0,
    step(dt: number) {
      if (this.active) {
        if (performance.now() - this.lastMove > 80) this.vel = 0
        return
      }
      this.angle += this.vel * 60 * dt
      this.vel *= Math.exp(-dt * 3)
    },
  })

  useEffect(() => {
    const el = target.current
    if (!el) return
    const d = s.current
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a,button,input,label,[data-switcher]')) return
      d.active = true
      d.lastX = e.clientX
      d.vel = 0
    }
    const move = (e: PointerEvent) => {
      if (!d.active) return
      const dx = (e.clientX - d.lastX) * 0.01
      d.angle += dx
      d.vel = dx
      d.lastX = e.clientX
      d.lastMove = performance.now()
    }
    const up = () => (d.active = false)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [target])

  return s
}

