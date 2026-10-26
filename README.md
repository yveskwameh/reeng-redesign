# Reeng — website redesign

The reeng.xyz site rebuilt with the same stack (React 19 + Vite + Tailwind v4 + GSAP/ScrollTrigger + React Router), plus real-time 3D (three.js, React Three Fiber, drei).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Layout

| Path | What |
|---|---|
| `src/content/product.ts` | All product facts in one place (assumed values are commented) |
| `src/scene/` | The persistent 3D canvas (`Scene.tsx`) and the ring model wrapper (`Ring.tsx`) |
| `src/pages/` | Home (section stubs), checkout, order success, legal, 404 |
| `src/lib/useSmoothScroll.ts` | Lenis smooth scroll synced to ScrollTrigger |
| `public/models/reeng_ring.glb` | The ring (Draco); decoder self-hosted in `public/draco/` |
| `3d/build_ring.py` | Rebuilds the ring: `/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/build_ring.py`, then copy `3d/reeng_ring.glb` to `public/models/` |
| `research/` | Site audit, product facts, checkout plan, original assets |
