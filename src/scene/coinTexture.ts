import { CanvasTexture, CylinderGeometry, MeshStandardMaterial, SRGBColorSpace } from 'three'

/** Shared coin mesh parts: cylinder axis is Y, caps face ±Y. */
export const coinGeometry = new CylinderGeometry(0.22, 0.22, 0.035, 48)
export const coinEdge = new MeshStandardMaterial({ color: '#C9C9D6', metalness: 0.9, roughness: 0.3 })

export type CoinFace = { ticker: string; chain: string; bg: string; fg: string }

/** What every coin becomes after passing through the ring. */
export const COIN_OUT: CoinFace = { ticker: 'USDC', chain: 'BASE', bg: '#2775CA', fg: '#FFFFFF' }

const SIZE = 256
const cache = new Map<string, CanvasTexture>()

/** Coin face drawn to a canvas; cached per ticker+chain, redrawn once web fonts load. */
export function coinTexture(face: CoinFace) {
  const key = `${face.ticker}/${face.chain}`
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4

  const draw = () => {
    const c = SIZE / 2
    ctx.fillStyle = face.bg
    ctx.fillRect(0, 0, SIZE, SIZE)
    // inner rim
    ctx.strokeStyle = face.fg
    ctx.globalAlpha = 0.35
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(c, c, c - 22, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1

    ctx.fillStyle = face.fg
    ctx.textAlign = 'center'
    ctx.font = '700 54px "Unbounded Variable", sans-serif'
    ctx.fillText(face.ticker, c, c + 14)
    ctx.font = '500 20px "Geist Mono Variable", monospace'
    ctx.fillText(face.chain, c, c + 56)
    tex.needsUpdate = true
  }
  draw()
  document.fonts.ready.then(draw)

  cache.set(key, tex)
  return tex
}
