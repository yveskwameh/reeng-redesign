import { CanvasTexture, SRGBColorSpace } from 'three'
import type { Place } from '../content/places'

const W = 480
const H = 780

export type ScreenPhase = 'ready' | 'paid'

const DEFAULT: Pick<Place, 'merchant' | 'amount'> = { merchant: 'Reeng', amount: 50 }

/**
 * Terminal touchscreen drawn to a canvas (crisper and more reliable than DOM-in-3D, and it
 * uses the page's fonts once they've loaded). Like a modern Android terminal: merchant and
 * amount up top, the contactless zone below — that's where the ring touches.
 */
export function createScreen() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  let last: [ScreenPhase, Pick<Place, 'merchant' | 'amount'>] = ['ready', DEFAULT]

  function draw(phase: ScreenPhase, place: Pick<Place, 'merchant' | 'amount'> = DEFAULT) {
    last = [phase, place]
    const paid = phase === 'paid'
    ctx.fillStyle = '#0B0B10'
    ctx.fillRect(0, 0, W, H)
    ctx.textAlign = 'center'

    // status bar
    ctx.fillStyle = '#5F5F6C'
    ctx.font = '500 20px "Geist Mono Variable", monospace'
    ctx.fillText(place.merchant.toUpperCase(), W / 2, 52)

    ctx.fillStyle = paid ? '#C8FF4D' : '#F5F4F0'
    ctx.font = '700 84px "Unbounded Variable", sans-serif'
    ctx.fillText(`$${place.amount.toFixed(2)}`, W / 2, 190)
    ctx.fillStyle = '#8A8A99'
    ctx.font = '500 20px "Geist Mono Variable", monospace'
    ctx.fillText(paid ? 'APPROVED  ·  0.8 S' : 'PRESENT CARD OR RING', W / 2, 240)

    // contactless zone (lower half)
    const cy = 520
    ctx.strokeStyle = paid ? '#C8FF4D' : '#2A2A33'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(50, 330, W - 100, 380, 36)
    ctx.stroke()
    ctx.lineCap = 'round'
    if (paid) {
      ctx.strokeStyle = '#C8FF4D'
      ctx.lineWidth = 16
      ctx.beginPath()
      ctx.moveTo(W / 2 - 56, cy)
      ctx.lineTo(W / 2 - 14, cy + 42)
      ctx.lineTo(W / 2 + 64, cy - 46)
      ctx.stroke()
    } else {
      // contactless symbol: three arcs
      ctx.strokeStyle = '#F5F4F0'
      ctx.lineWidth = 12
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(W / 2 - 50, cy, 40 + i * 30, -Math.PI / 4, Math.PI / 4)
        ctx.stroke()
      }
    }
    texture.needsUpdate = true
  }

  draw('ready')
  // redraw once the web fonts are ready, otherwise the first frame uses fallbacks
  document.fonts.ready.then(() => draw(...last))

  return { texture, draw }
}
