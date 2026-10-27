import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Color, Euler, MathUtils, Mesh, Quaternion, Vector3, type Group, type MeshStandardMaterial, type Object3D } from 'three'
import { product } from '../content/product'
import { innerDiameter } from '../content/sizing'
import { Ring } from '../scene/Ring'
import { pointer } from './interaction'
import { Logo, Stage } from './stage'

const links = ['How it works', 'Security', 'Specs']

/** Each tag turns the ring to the view that shows it, and can pull a part out. */
const FEATURES = [
  { id: 'shell', tag: 'Zirconia ceramic', note: 'High-gloss, scratch-resistant shell', view: 'Three-quarter', rot: [1.15, 0.4, -0.35], part: 'Shell', open: 0 },
  { id: 'chip', tag: 'Secure element', note: 'Keys never leave the chip', view: 'Exploded', rot: [0.55, 0, -0.2], part: 'SecureChip', open: 1 },
  { id: 'nfc', tag: 'NFC · no battery', note: 'Powered by the terminal’s field', view: 'Exploded', rot: [0.75, 0.6, 0.1], part: 'Antenna', open: 1 },
  { id: 'width', tag: `${product.specs.widthMm} mm · IP68`, note: 'Slim enough to forget. Swim-safe.', view: 'Profile', rot: [0, 0.2, Math.PI / 2], part: null, open: 0 },
] as const

const OFFSETS: Record<string, [number, number, number]> = {
  Shell: [0, 0.6, 0],
  Liner: [0, -0.6, 0],
  SecureChip: [0, 0, -1],
}
const GLOW = new Color('#9730F6')
const target = new Quaternion()
const lean = new Quaternion()
const leanE = new Euler()
const e = new Euler()
const rest = new WeakMap<Object3D, Vector3>()

/**
 * C — Spec sheet. Copy on the left; on the right the ring sits in a technical frame
 * with dimension marks. The four tags around it are the interaction: hover one and the
 * ring turns (or opens up) to show that feature. It cycles on its own until you do.
 */
export function OptionSpec() {
  const [active, setActive] = useState(0)
  const [hovering, setHovering] = useState(false)
  const f = FEATURES[active]

  useEffect(() => {
    if (hovering) return
    const id = setInterval(() => setActive((a) => (a + 1) % FEATURES.length), 3600)
    return () => clearInterval(id)
  }, [hovering])

  return (
    <>
      {/* nav: mono bracket links, centred logo, a square black order block */}
      <header className="fixed inset-x-0 top-0 z-40 bg-white">
        <nav className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 md:px-8">
          <ul className="hidden gap-1 font-mono text-xs uppercase tracking-wider text-ash md:flex">
            {links.map((l) => (
              <li key={l}>
                <a href="#" className="px-1.5 py-1 transition hover:bg-ink hover:text-white">[ {l} ]</a>
              </li>
            ))}
          </ul>
          <div className="max-md:justify-self-start"><Logo /></div>
          <a href="#" className="justify-self-end bg-ink px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white transition hover:bg-violet">
            [ Order — ${product.price.earlyBird} ]
          </a>
        </nav>
      </header>

      <section className="mx-auto grid min-h-svh max-w-7xl items-center gap-8 px-5 pb-10 pt-24 md:grid-cols-[5fr_7fr] md:px-8">
        <div>
          <p className="label-mono text-violet">Stablecoin wallet · NFC ring</p>
          <h1 className="display mt-4 text-5xl text-ink md:text-7xl">{product.tagline}</h1>
          <p className="mt-5 max-w-md text-lg text-ash">{product.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className="bg-ink px-7 py-3.5 font-medium text-white transition hover:bg-violet">Order — ${product.price.earlyBird}</a>
            <a href="#" className="border border-ink px-7 py-3.5 font-medium text-ink transition hover:bg-ink hover:text-white">Find your size</a>
          </div>
        </div>

        <div>
          <div className="relative aspect-square max-h-[68svh] w-full border border-dashed border-ink/25 md:aspect-[5/4]">
            {/* corner crosshairs */}
            {['-left-1.5 -top-1.5', '-right-1.5 -top-1.5', '-left-1.5 -bottom-1.5', '-right-1.5 -bottom-1.5'].map((c) => (
              <span key={c} className={`absolute ${c} size-3 border-ink before:absolute before:left-1/2 before:top-0 before:h-3 before:w-px before:bg-ink after:absolute after:left-0 after:top-1/2 after:h-px after:w-3 after:bg-ink`} />
            ))}
            <Stage>
              <SpecRing feature={active} />
            </Stage>
            <p className="label-mono absolute left-4 top-4 text-ash">
              View {String(active + 1).padStart(2, '0')} / <span className="text-ink">{f.view}</span>
            </p>
            <p className="label-mono absolute right-4 top-4 hidden text-right text-ash md:block">Ø {innerDiameter(9).toFixed(1)} mm · US 9</p>
            {/* dimension line */}
            <div className="absolute inset-x-[22%] bottom-6 flex items-center gap-2 text-ash">
              <span className="h-3 w-px bg-ink/40" />
              <span className="h-px flex-1 bg-ink/25" />
              <span className="font-mono text-[11px]">{f.note}</span>
              <span className="h-px flex-1 bg-ink/25" />
              <span className="h-3 w-px bg-ink/40" />
            </div>
          </div>

          <ul
            className="mt-3 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4"
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
          >
            {FEATURES.map((ft, i) => (
              <li key={ft.id}>
                <button
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`flex w-full items-center gap-2 px-3 py-3 text-left font-mono text-xs uppercase tracking-wider transition ${
                    i === active ? 'bg-ink text-white' : 'bg-white text-ash hover:text-ink'
                  }`}
                >
                  <span className={i === active ? 'text-violet-glow' : 'text-ink/30'}>{String(i + 1).padStart(2, '0')}</span>
                  {ft.tag}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

function SpecRing({ feature }: { feature: number }) {
  const ref = useRef<Group>(null)
  const aspect = useThree((s) => s.viewport.aspect)
  const open = useRef(0)

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const f = FEATURES[feature]
    e.set(f.rot[0], f.rot[1], f.rot[2])
    target.setFromEuler(e)
    leanE.set(-pointer.y * 0.12, pointer.x * 0.18, 0)
    lean.setFromEuler(leanE)
    target.premultiply(lean)
    g.quaternion.slerp(target, 1 - Math.exp(-dt * 5))
    g.scale.setScalar((0.62 - 0.1 * open.current) * Math.min(1, aspect / 1.15))

    open.current = MathUtils.damp(open.current, f.open, 5, dt)
    const root = g.getObjectByName('ReengRing')
    if (!root) return
    for (const part of root.children) {
      let r = rest.get(part)
      if (!r) rest.set(part, (r = part.position.clone()))
      const o = OFFSETS[part.name] ?? [0, 0, 0]
      part.position.set(r.x + o[0] * open.current, r.y + o[1] * open.current, r.z + o[2] * open.current)
      const lit = part.name === f.part
      part.traverse((m) => {
        if (!(m instanceof Mesh)) return
        const mat = m.material as MeshStandardMaterial
        mat.emissive.copy(GLOW)
        mat.emissiveIntensity = MathUtils.damp(mat.emissiveIntensity, lit ? (part.name === 'Shell' ? 0.06 : 0.5) : 0, 6, dt)
      })
    }
  })

  return (
    <group ref={ref}>
      <Ring exposeParts />
    </group>
  )
}
