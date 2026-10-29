import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { smoothstep } from '../scene/scrollState'

/** How far a component rises as it arrives (px). */
const RISE = 56
/** What counts as one component: text blocks and lists, plus anything marked `data-reveal`. */
const PARTS = 'h2, h3, p, ul, ol, dl, [data-reveal]'
/** The shortest stretch of scroll a fade may take (share of the screen), so nothing pops. */
const MIN_SPAN = 0.45
/** How quickly what's shown catches up with the scroll position each frame, so wheel steps glide. */
const EASE = 0.12

type State = { shown: number; target: number }
const states = new WeakMap<HTMLElement, State>()
const moving = new Set<HTMLElement>()

function paint(el: HTMLElement, v: number) {
  if (v >= 1) {
    el.style.opacity = ''
    el.style.translate = ''
    return
  }
  const e = smoothstep(0, 1, v)
  el.style.opacity = `${e}`
  el.style.translate = `0 ${(1 - e) * RISE}px`
}

// one ticker for every revealing component: ease what's shown toward what scroll asks for
gsap.ticker.add(() => {
  moving.forEach((el) => {
    const s = states.get(el)!
    s.shown += (s.target - s.shown) * EASE
    if (Math.abs(s.target - s.shown) < 0.003) s.shown = s.target
    paint(el, s.shown)
    if (s.shown === s.target || !el.isConnected) moving.delete(el)
  })
})

/**
 * Brings a section's components in one by one as they scroll into view. Each one starts
 * fading in and rising the moment it crosses the bottom edge of the screen and is fully in
 * by the time it reaches its resting place (for a pinned section, where it sits once the
 * section has pinned). Components that rest low on the screen still get at least MIN_SPAN
 * of scroll, carrying on into the pinned hold, so nothing pops in; and what's shown eases
 * toward the scroll position, so it glides rather than stepping with the wheel. Plays back
 * on the way up.
 *
 * Only the outermost match is animated (a card's own paragraphs ride along with it), and
 * elements whose opacity or translate the page already drives are left alone. Uses the
 * `translate` property, so it stacks with any `transform` (e.g. the drift in trackSection).
 * Call inside useGSAP so the trigger is cleaned up.
 */
export function reveal(section: HTMLElement) {
  const sticky = section.querySelector<HTMLElement>(':scope > .sticky')
  const frame = sticky ?? (section.firstElementChild as HTMLElement | null)
  if (!frame) return

  const update = () => {
    const H = window.innerHeight
    const remaining = document.documentElement.scrollHeight - H - window.scrollY
    const sectionTop = section.getBoundingClientRect().top
    const frameTop = frame.getBoundingClientRect().top
    // where the frame sits in the section when it comes to rest (a sticky one: at the top)
    const frameOff = sticky ? 0 : frameTop - sectionTop
    frame.querySelectorAll<HTMLElement>(PARTS).forEach((el) => {
      if (!el.dataset.revealing) {
        // the page already animates this one, or it sits inside a component that's animated
        const own = el.getAttribute('style') ?? ''
        if (/opacity|translate/.test(own) || /(^|\s)(-?translate-|opacity-)/.test(el.className)) return
        const outer = el.parentElement?.closest<HTMLElement>(PARTS)
        if (outer && frame.contains(outer)) return
        el.dataset.revealing = '1'
      }
      // its place once the section reaches the top of the screen (without our own lift)
      const lift = parseFloat(el.style.translate.split(' ')[1] ?? '0') || 0
      const rest = frameOff + el.getBoundingClientRect().top - lift - frameTop
      // where it would be if the page just kept scrolling: keeps rising through the pinned hold
      const at = sectionTop + rest
      // near the end of the page (the footer), finish by the highest point it can reach
      const reach = H - (at - remaining)
      const span = Math.max(1, Math.min(Math.max(H - rest, H * MIN_SPAN), reach))
      const target = Math.min(1, Math.max(0, (H - at) / span))

      let s = states.get(el)
      if (!s) {
        // first sight: start hidden unless it's already fully in (e.g. a reload mid-page)
        s = { shown: target >= 1 ? 1 : 0, target }
        states.set(el, s)
        paint(el, s.shown)
      }
      s.target = target
      if (s.shown !== target) moving.add(el)
    })
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: `top top-=${MIN_SPAN * 100}%`,
    onUpdate: update,
    onRefresh: update,
    onLeave: update,
    onLeaveBack: update,
  })
}
