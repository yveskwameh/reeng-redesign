import { gsap } from 'gsap'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { scrollToY } from '../lib/useSmoothScroll'

// the home page's sections, ticked along the rail
const SECTIONS = [
  ['top', 'Top'],
  ['tap-to-pay', 'Tap to pay'],
  ['cross-chain', 'Any coin'],
  ['how-it-works', 'How it works'],
  ['security', 'Security'],
  ['email', 'Pay by email'],
  ['specs', 'Specs'],
  ['order', 'Order'],
  ['compare', 'Compare'],
  ['ecosystem', 'Ecosystem'],
  ['faq', 'FAQ'],
  ['get-reeng', 'Get Reeng'],
] as const

/** Where each section starts, as a share of the scrollable height (home page only). */
function useMarks(max: number) {
  const [marks, setMarks] = useState<{ id: string; label: string; at: number }[]>([])
  useEffect(() => {
    setMarks(
      SECTIONS.flatMap(([id, label]) => {
        const el = document.getElementById(id)
        return el ? [{ id, label, at: Math.min(1, el.offsetTop / max) }] : []
      }),
    )
  }, [max])
  return marks
}

/**
 * The page's own scrollbar, replacing the native one: a thin rail down the right edge that
 * fills violet as you go, with a tick where each section starts. Drag the dot or click the
 * rail to move; the round arrow at its foot fades in once you're past the first screen and
 * glides back to the top.
 */
export function ScrollBar() {
  const track = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; scroll: number } | null>(null)
  // React only hears about the rare changes (page height, crossing the first screen);
  // the fill and dot follow scroll every frame by writing their styles directly
  const [max, setMax] = useState(1)
  const [past, setPast] = useState(false)
  const marks = useMarks(max)

  useEffect(() => {
    const read = () => {
      const H = window.innerHeight
      const m = Math.max(1, document.documentElement.scrollHeight - H)
      const y = window.scrollY
      const at = `${Math.min(1, y / m) * 100}%`
      if (fill.current) fill.current.style.height = at
      if (dot.current) dot.current.style.top = at
      setMax((o) => (o === m ? o : m))
      setPast(y > H * 0.8)
    }
    read()
    gsap.ticker.add(read)
    return () => gsap.ticker.remove(read)
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('custom-scrollbar')
    return () => document.documentElement.classList.remove('custom-scrollbar')
  }, [])

  // click on the rail: glide to that point
  const jump = (e: ReactPointerEvent) => {
    const r = track.current!.getBoundingClientRect()
    scrollToY(((e.clientY - r.top) / r.height) * max)
  }

  return (
    <>
      {/* only when there's somewhere to scroll */}
      <div ref={track} onPointerDown={jump} className={`fixed bottom-20 right-1.5 top-24 z-[70] w-4 cursor-pointer ${max > 40 ? '' : 'hidden'}`}>
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-line" />
        <div ref={fill} className="absolute left-1/2 top-0 w-0.5 -translate-x-1/2 rounded-full bg-violet" />
        {marks.map((m) => (
          <span key={m.id} title={m.label} className="absolute left-1/2 h-0.5 w-2 -translate-x-1/2 rounded-full bg-ink/25" style={{ top: `${m.at * 100}%` }} />
        ))}
        {/* the dot: drag it to scroll */}
        <div
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            e.currentTarget.setPointerCapture(e.pointerId)
            drag.current = { y: e.clientY, scroll: window.scrollY }
          }}
          onPointerMove={(e) => {
            const d = drag.current
            if (!d) return
            const travel = Math.max(1, track.current?.clientHeight ?? 1)
            scrollToY(Math.min(max, Math.max(0, d.scroll + ((e.clientY - d.y) / travel) * max)), true)
          }}
          onPointerUp={() => void (drag.current = null)}
          className="absolute left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full bg-violet ring-4 ring-violet/15 active:cursor-grabbing"
          ref={dot}
        />
      </div>

      <button
        type="button"
        aria-label="Back to top"
        onClick={() => scrollToY(0)}
        tabIndex={past ? 0 : -1}
        className={`fixed bottom-5 right-2.5 z-[70] grid size-10 md:size-11 cursor-pointer place-items-center rounded-full bg-ink text-white shadow-lg shadow-ink/20 transition duration-300 hover:bg-violet ${
          past ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
          <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  )
}
