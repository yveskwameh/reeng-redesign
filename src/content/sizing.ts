// Ring sizing, shared by the configurator, the size drawer and the spec callouts.
// US sizes follow the standard formula: inner diameter (mm) = 11.63 + 0.8128 × size.

/**
 * ISO/IEC 7810 ID-1 bank card. The printable sizer calibrates on the long edge (85.6 mm);
 * on screen we use the short edge, which still fits a phone held upright.
 */
export const CARD_MM = 85.6
export const CARD_SHORT_MM = 53.98
/** CSS reference pixel density: 96 px per inch. Real screens vary, hence calibration. */
export const DEFAULT_PX_PER_MM = 96 / 25.4

export const innerDiameter = (us: number) => 11.63 + 0.8128 * us
export const circumference = (us: number) => innerDiameter(us) * Math.PI

/**
 * Nearest US size for a measured inner diameter. Between two sizes, pick the larger
 * one (the client's sizer rule) — so anything past a quarter-size rounds up.
 */
export function sizeFromDiameter(mm: number, sizes: readonly number[]) {
  const exact = (mm - 11.63) / 0.8128
  const pick = Math.ceil(exact - 0.25)
  return Math.min(sizes[sizes.length - 1], Math.max(sizes[0], pick))
}
