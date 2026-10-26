import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

/**
 * Scroll to a page offset: a smooth glide for in-page jumps, or `immediate` when
 * arriving from another route. Falls back to native when Lenis is off (reduced motion).
 */
export function scrollToY(y: number, immediate = false) {
  // immediate jumps go native: Lenis clamps to a page height it may have measured
  // before every section rendered; it re-syncs from the native scroll position
  if (lenis && !immediate) lenis.scrollTo(y, { duration: 1.2 })
  else window.scrollTo({ top: y, behavior: 'auto' })
}

/** Freeze page scrolling while an overlay (drawer) is open. */
export function setScrollLocked(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

/** Lenis smooth scroll, ticked by GSAP so ScrollTrigger stays in sync. */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // anchors: nav links like "/#security" glide instead of jumping
    const instance = new Lenis({ lerp: 0.1, anchors: true })
    lenis = instance
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      if (lenis === instance) lenis = null
    }
  }, [])

  // ScrollTrigger only re-measures on window resize; content that changes height
  // (FAQ filter/accordion, drawers, fonts) would leave later sections' triggers stale
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    let last = document.body.scrollHeight
    const ro = new ResizeObserver(() => {
      if (document.body.scrollHeight === last) return
      last = document.body.scrollHeight
      clearTimeout(t)
      t = setTimeout(() => ScrollTrigger.refresh(), 120)
    })
    ro.observe(document.body)
    return () => {
      clearTimeout(t)
      ro.disconnect()
    }
  }, [])
}
