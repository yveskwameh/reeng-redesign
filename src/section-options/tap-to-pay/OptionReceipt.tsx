import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, type RefObject } from 'react'
import { CanvasTexture, MathUtils, SRGBColorSpace, type Mesh } from 'three'
import { Stage } from '../../hero-options/stage'
import { TAP_BEATS, tapFx, TapScene, useSectionProgress, type TapFx } from './shared'

const STEPS = ['Hover', 'Tap', 'Paid']
const NARROW = { position: [0.25, -0.95, 0] as [number, number, number], scale: 0.62 }
const ITEMS = [
  ['Coffee beans', '18.50'],
  ['Oat milk', '4.25'],
  ['Sourdough', '7.25'],
  ['Flowers', '20.00'],
]

/**
 * A — Receipt. Scroll brings the ring down onto the reader; the moment it's paid, a paper
 * receipt prints out of the top of the terminal as you keep scrolling. Numbered steps on
 * the left (after Square's "Tap and go") light up with the scroll.
 */
export function OptionReceipt() {
  const section = useRef<HTMLElement>(null)
  const fx = useRef<TapFx>({ dip: 0, paid: 0 })
  const print = useRef(0)
  const [phase, setPhase] = useState(0)

  useSectionProgress(section, (p) => {
    fx.current = tapFx(p)
    print.current = MathUtils.smoothstep(p, TAP_BEATS.paid, 0.92)
    setPhase(p >= TAP_BEATS.paid ? 2 : p >= TAP_BEATS.touch ? 1 : 0)
  })

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <TapScene fx={fx} position={[1.3, -0.55, 0]} scale={1.1} narrow={NARROW} />
          <Receipt print={print} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl items-start px-5 pt-28 md:items-center md:px-8 md:pt-0">
          <div className="max-w-md">
            <h2 className="display text-5xl text-ink md:text-7xl">
              Tap. <span className={`transition-colors duration-300 ${phase === 2 ? 'text-violet' : ''}`}>Paid.</span>
            </h2>
            <p className="mt-5 text-lg text-ash">Works at any contactless card terminal. No phone, no card.</p>
            <ol className="mt-10 hidden space-y-3 md:block">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-4">
                  <span
                    className={`grid size-10 place-items-center rounded-full font-mono text-sm transition-colors duration-300 ${
                      i === phase ? (i === 2 ? 'bg-lime text-ink' : 'bg-ink text-white') : i < phase ? 'bg-mist text-ink' : 'border border-line text-ash'
                    }`}
                  >
                    {i < phase ? '✓' : i + 1}
                  </span>
                  <span className={`text-lg transition-colors duration-300 ${i <= phase ? 'text-ink' : 'text-ash'}`}>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Paper receipt sliding out of the top of the terminal (it starts hidden behind the body). */
function Receipt({ print }: { print: RefObject<number> }) {
  const ref = useRef<Mesh>(null)
  const portrait = useThree((st) => st.viewport.aspect < 0.9)
  const texture = useMemo(() => {
    const W = 360
    const H = 560
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d')!
    const draw = () => {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#0A0A0F'
      ctx.textAlign = 'center'
      ctx.font = '700 30px "Unbounded Variable", sans-serif'
      ctx.fillText('Corner Market', W / 2, 60)
      ctx.font = '500 16px "Geist Mono Variable", monospace'
      ctx.fillStyle = '#5F5F6C'
      ctx.fillText('27 OCT · 02:41', W / 2, 92)
      ctx.textAlign = 'left'
      ctx.fillStyle = '#0A0A0F'
      ctx.font = '500 20px "Geist Mono Variable", monospace'
      ITEMS.forEach(([name, price], i) => {
        ctx.fillText(name, 30, 160 + i * 40)
        ctx.textAlign = 'right'
        ctx.fillText(price, W - 30, 160 + i * 40)
        ctx.textAlign = 'left'
      })
      ctx.setLineDash([6, 6])
      ctx.strokeStyle = '#C9C9D6'
      ctx.beginPath()
      ctx.moveTo(30, 330)
      ctx.lineTo(W - 30, 330)
      ctx.stroke()
      ctx.font = '700 26px "Geist Mono Variable", monospace'
      ctx.fillText('TOTAL', 30, 380)
      ctx.textAlign = 'right'
      ctx.fillText('50.00 USDC', W - 30, 380)
      ctx.textAlign = 'center'
      ctx.fillStyle = '#9730F6'
      ctx.font = '600 18px "Geist Mono Variable", monospace'
      ctx.fillText('PAID WITH REENG · 0.8 S', W / 2, 450)
      ctx.fillStyle = '#5F5F6C'
      ctx.font = '500 15px "Geist Mono Variable", monospace'
      ctx.fillText('BASE · 0x9f…3a', W / 2, 482)
      t.needsUpdate = true
    }
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 4
    draw()
    document.fonts.ready.then(draw)
    return t
  }, [])

  useFrame(() => {
    const m = ref.current
    if (!m) return
    // 0: tucked behind the terminal body; 1: fully out above it
    m.position.y = MathUtils.lerp(0.2, 1.75, print.current)
    m.visible = print.current > 0.001
  })

  return (
    <group position={portrait ? NARROW.position : [1.3, -0.55, 0]} rotation={[-0.85, -0.25, 0]} scale={portrait ? NARROW.scale : 1.1}>
      <mesh ref={ref} position={[0, 0.25, -0.03]}>
        <planeGeometry args={[1.05, 1.63]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}
