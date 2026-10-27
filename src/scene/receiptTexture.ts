import { CanvasTexture, SRGBColorSpace } from 'three'
import type { Place } from '../content/places'

const W = 360
const H = 560
const cache = new Map<string, CanvasTexture>()

/** Paper receipt for one place, drawn to a canvas; cached, redrawn once web fonts load. */
export function receiptTexture(place: Place) {
  const hit = cache.get(place.merchant)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4

  const draw = () => {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#0A0A0F'
    ctx.textAlign = 'center'
    ctx.font = '700 30px "Unbounded Variable", sans-serif'
    ctx.fillText(place.merchant, W / 2, 64)
    ctx.fillStyle = '#5F5F6C'
    ctx.font = '500 16px "Geist Mono Variable", monospace'
    ctx.fillText('27 OCT · 02:41', W / 2, 96)

    ctx.fillStyle = '#0A0A0F'
    ctx.font = '500 20px "Geist Mono Variable", monospace'
    place.items.forEach(([name, price], i) => {
      ctx.textAlign = 'left'
      ctx.fillText(name, 30, 170 + i * 40)
      ctx.textAlign = 'right'
      ctx.fillText(price, W - 30, 170 + i * 40)
    })
    ctx.setLineDash([6, 6])
    ctx.strokeStyle = '#C9C9D6'
    ctx.beginPath()
    ctx.moveTo(30, 330)
    ctx.lineTo(W - 30, 330)
    ctx.stroke()
    ctx.font = '700 26px "Geist Mono Variable", monospace'
    ctx.textAlign = 'left'
    ctx.fillText('TOTAL', 30, 380)
    ctx.textAlign = 'right'
    ctx.fillText(`$${place.amount.toFixed(2)}`, W - 30, 380)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#9730F6'
    ctx.font = '600 18px "Geist Mono Variable", monospace'
    ctx.fillText('PAID WITH REENG · 0.8 S', W / 2, 450)
    ctx.fillStyle = '#5F5F6C'
    ctx.font = '500 15px "Geist Mono Variable", monospace'
    ctx.fillText('USDC · BASE', W / 2, 482)
    tex.needsUpdate = true
  }
  draw()
  document.fonts.ready.then(draw)
  cache.set(place.merchant, tex)
  return tex
}
