import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState, type ScrollKey } from '../scene/scrollState'

type Keys = { enter?: ScrollKey; progress?: ScrollKey; exit?: ScrollKey }

/**
 * Write a pinned (sticky) section's scroll progress into scrollState:
 * - enter:    section top hits the viewport bottom → top hits the top
 * - progress: while the section is pinned
 * - exit:     section bottom leaves the viewport
 * Call inside useGSAP so the triggers are cleaned up with the component.
 */
export function trackSection(el: HTMLElement, keys: Keys, onProgress?: (p: number) => void) {
  const write = (key: ScrollKey | undefined) => (s: ScrollTrigger) => {
    if (key) scrollState[key] = s.progress
  }
  ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'top top', onUpdate: write(keys.enter) })
  ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (s) => {
      write(keys.progress)(s)
      onProgress?.(s.progress)
    },
  })
  ScrollTrigger.create({ trigger: el, start: 'bottom bottom', end: 'bottom top', onUpdate: write(keys.exit) })
}
