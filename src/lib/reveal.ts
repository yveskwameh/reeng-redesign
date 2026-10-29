import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { smoothstep } from '../scene/scrollState'

/** How far content rises as it arrives (px). */
const RISE = 40

/**
 * Fades a section's content in and lifts it into place as the section scrolls into view
 * (tied to scroll, so it plays back on the way up). Animates the section's sticky frame, or
 * its first child if it isn't pinned; uses `translate` so it stacks with the drift's
 * `transform` (see trackSection). Call inside useGSAP so the trigger is cleaned up.
 */
export function reveal(section: HTMLElement) {
  const target = section.querySelector<HTMLElement>(':scope > .sticky') ?? (section.firstElementChild as HTMLElement | null)
  if (!target) return
  const apply = (p: number) => {
    const e = smoothstep(0, 1, p)
    target.style.opacity = `${e}`
    target.style.translate = e >= 1 ? '' : `0 ${(1 - e) * RISE}px`
  }
  ScrollTrigger.create({
    trigger: section,
    start: 'top 92%',
    end: 'top 40%',
    onUpdate: (s) => apply(s.progress),
    onRefresh: (s) => apply(s.progress),
  })
}
