import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Euler, Quaternion, Vector3, type Group } from 'three'
import { product } from '../content/product'
import { Ring } from '../scene/Ring'
import { pointer, useDragSpin } from './interaction'
import { PillNav } from './PillNav'
import { Stage } from './stage'

const STAND = new Quaternion().setFromEuler(new Euler(Math.PI / 2 - 0.12, 0, 0)) // upright, tipped back a touch
const Y = new Vector3(0, 1, 0)
const turn = new Quaternion()
const lean = new Quaternion()
const leanE = new Euler()

/**
 * B — Studio. The hero is a product stage: a soft grey card with the ring standing on
 * a turntable. Drag to turn it (the dial reads the angle), try the finishes, and the
 * price sits in its own tile.
 */
export function OptionStudio() {
  const card = useRef<HTMLDivElement>(null)
  const dial = useRef<HTMLSpanElement>(null)
  const drag = useDragSpin(card)
  const [finish, setFinish] = useState(product.finishes[0])

  return (
    <>
      <PillNav />

      <section className="px-3 pt-20 md:px-6">
        <div ref={card} className="relative h-[calc(100svh-6.5rem)] min-h-[560px] cursor-grab touch-pan-y overflow-hidden rounded-[2rem] bg-mist active:cursor-grabbing">
          <Stage shadow={{ y: -0.9, opacity: 0.5 }}>
            <TurntableRing drag={drag} finish={finish.color} dial={dial} />
          </Stage>

          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-3 p-6 md:flex-row md:items-start md:justify-between md:p-10">
            <h1 className="display max-w-[12ch] text-4xl text-ink md:text-6xl">{product.tagline}</h1>
            <p className="max-w-xs text-ash md:text-right">{product.summary}</p>
          </div>

          {/* finishes */}
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
            <p className="label-mono mb-3 text-ash">Finish · {finish.name}{!finish.available && ' (soon)'}</p>
            <div className="flex gap-2">
              {product.finishes.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFinish(f)}
                  aria-label={f.name}
                  className={`size-9 rounded-full border-2 transition ${f.id === finish.id ? 'border-violet' : 'border-white'}`}
                  style={{ background: f.color }}
                />
              ))}
            </div>
          </div>

          {/* turntable dial */}
          <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center md:flex md:bottom-10">
            <span ref={dial} className="font-mono text-sm tabular-nums text-ink">000°</span>
            <span className="label-mono mt-1 text-ash">Drag to turn</span>
          </div>

          {/* price tile */}
          <div className="absolute bottom-6 right-6 w-[min(18rem,calc(100%-3rem))] rounded-3xl bg-white p-5 shadow-sm md:bottom-10 md:right-10 max-md:hidden">
            <p className="label-mono text-ash">Early bird</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-ink">${product.price.earlyBird}</span>
              <span className="text-ash line-through">${product.price.regular}</span>
            </p>
            <a href="#" className="mt-4 block rounded-full bg-ink py-3 text-center font-medium text-white transition hover:bg-violet">
              Order now
            </a>
          </div>
        </div>
        <a href="#" className="mt-3 block rounded-full bg-ink py-3.5 text-center font-medium text-white md:hidden">
          Order — ${product.price.earlyBird}
        </a>
      </section>
    </>
  )
}

function TurntableRing({
  drag,
  finish,
  dial,
}: {
  drag: ReturnType<typeof useDragSpin>
  finish: string
  dial: React.RefObject<HTMLSpanElement | null>
}) {
  const ref = useRef<Group>(null)
  const aspect = useThree((s) => s.viewport.aspect)

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const d = drag.current
    d.step(dt)
    if (!d.active && Math.abs(d.vel) < 0.002) d.angle += dt * 0.25
    leanE.set(-pointer.y * 0.08, 0, pointer.x * -0.05)
    lean.setFromEuler(leanE)
    turn.setFromAxisAngle(Y, d.angle)
    g.quaternion.copy(turn).multiply(STAND).premultiply(lean)
    // a slow bob above the shadow
    g.position.y = -0.05 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04
    g.scale.setScalar(0.7 * Math.min(1, aspect / 1.1))
    if (dial.current) {
      const deg = ((((d.angle * 180) / Math.PI) % 360) + 360) % 360
      dial.current.textContent = `${String(Math.round(deg)).padStart(3, '0')}°`
    }
  })

  return (
    <group ref={ref}>
      <Ring finish={finish} />
    </group>
  )
}
