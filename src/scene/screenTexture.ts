import { CanvasTexture, SRGBColorSpace } from 'three'

const W = 512
const H = 440

export type ScreenPhase = 'ready' | 'paid'

/**
 * Terminal screen drawn to a canvas: crisper and more reliable than DOM-in-3D,
 * and it uses the page's own fonts once they've loaded.
 */
export function createScreen() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4

  function draw(phase: ScreenPhase) {
    const paid = phase === 'paid'
    const accent = paid ? '#C8FF4D' : '#8A8A99'
    ctx.fillStyle = '#060609'
    ctx.fillRect(0, 0, W, H)
    ctx.textAlign = 'center'

    ctx.fillStyle = accent
    ctx.font = '500 26px "Geist Mono Variable", monospace'
    ctx.fillText(paid ? 'PAID  ·  0.8 S' : 'TAP TO PAY', W / 2, 92)

    ctx.fillStyle = paid ? '#C8FF4D' : '#F5F4F0'
    ctx.font = '700 92px "Unbounded Variable", sans-serif'
    ctx.fillText('50.00', W / 2, 250)

    ctx.fillStyle = '#8A8A99'
    ctx.font = '500 26px "Geist Mono Variable", monospace'
    ctx.fillText('USDC  ·  BASE', W / 2, 320)

    if (paid) {
      // check mark
      ctx.strokeStyle = '#C8FF4D'
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(W / 2 - 26, 380)
      ctx.lineTo(W / 2 - 6, 400)
      ctx.lineTo(W / 2 + 30, 362)
      ctx.stroke()
    }
    texture.needsUpdate = true
  }

  draw('ready')
  // redraw once the web fonts are ready, otherwise the first frame uses fallbacks
  document.fonts.ready.then(() => draw('ready'))

  return { texture, draw }
}
