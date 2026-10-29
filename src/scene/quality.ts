/**
 * How hard the 3D can work on this device. The canvas fills the screen and redraws every
 * frame, so resolution is the main cost: it is capped below the screen's full density (the
 * difference isn't visible on a moving, softly lit ring), starts low on devices that look
 * weak, and is then tuned live by PerformanceMonitor (see Scene).
 */
const nav = navigator as Navigator & { deviceMemory?: number }
/**
 * Genuinely weak devices only: under 4 cores or under 4 GB. A 2019 flagship (8 cores, 4 GB)
 * holds 60 fps at full quality, so treating it as weak just made the 3D blurry and jagged.
 */
export const LOW_END = (nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4

/** Highest pixel density the canvas renders at. */
export const DPR_MAX = Math.min(window.devicePixelRatio || 1, 1.75)
/** Lowest it falls to when frames drop. */
export const DPR_MIN = Math.min(DPR_MAX, 1)
/**
 * Edge smoothing stays on: the canvas renders below the screen's density on every phone (at
 * most 1.75× on 2.6–3× screens), so without it the ring and terminal show stair-stepped edges.
 */
export const ANTIALIAS = true
/** The hero's contact shadow renders the scene again from below; a smaller map on weak devices. */
export const SHADOW_RES = LOW_END ? 256 : 512
