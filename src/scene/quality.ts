/**
 * How hard the 3D can work on this device. The canvas fills the screen and redraws every
 * frame, so resolution is the main cost: it is capped below the screen's full density (the
 * difference isn't visible on a moving, softly lit ring), starts low on devices that look
 * weak, and is then tuned live by PerformanceMonitor (see Scene).
 */
const nav = navigator as Navigator & { deviceMemory?: number }
/** Few cores or little memory (iOS reports 4 cores and no memory, so phones start here too). */
export const LOW_END = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4

/** Highest pixel density the canvas renders at. */
export const DPR_MAX = Math.min(window.devicePixelRatio || 1, 1.75)
/** Lowest it falls to when frames drop. */
export const DPR_MIN = Math.min(DPR_MAX, 1)
/** Edge smoothing only pays off on 1× screens; at higher densities it's cost without a visible gain. */
export const ANTIALIAS = (window.devicePixelRatio || 1) < 1.5
/** The hero's contact shadow renders the scene again from below; a smaller map on weak devices. */
export const SHADOW_RES = LOW_END ? 256 : 512
