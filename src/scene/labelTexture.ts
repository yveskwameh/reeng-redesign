import { CanvasTexture, SRGBColorSpace } from 'three'

const H = 96

/**
 * A single-line technical label ("Ø 18.9 MM") as a transparent texture.
 * Returns the texture and its aspect so a plane can be sized to match.
 */
export function labelTexture(text: string, color: string) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const font = '500 56px "Geist Mono Variable", monospace'
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4

  const draw = () => {
    ctx.font = font
    canvas.width = Math.ceil(ctx.measureText(text).width) + 24
    canvas.height = H
    ctx.font = font // resizing the canvas resets its state
    ctx.fillStyle = color
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 12, H / 2 + 2)
    tex.needsUpdate = true
  }
  draw()
  document.fonts.ready.then(draw)

  return { texture: tex, aspect: () => canvas.width / canvas.height }
}
