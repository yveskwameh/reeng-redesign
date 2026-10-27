# Performance: fast load and smooth scroll on low-end hardware

Research date: October 2026. Scope: the Reeng home page, a scroll-driven site with one fixed R3F canvas behind 13 pinned sections. Target hardware: old laptops with integrated GPUs (Intel UHD 620-class) and mid-range Android phones (Mali-G57 / Adreno 6xx-class, DPR 2.6 to 3).

Every external claim links its source. Numbers marked **measured** come from this repo (build of 27 Oct 2026, and a dev-build probe on an Apple M2 in Chrome). Nothing in `src/` was changed to produce this document.

---

## 0. Baseline (measured)

### Build output (`npx vite build`, Vite 8.3.5)

| Chunk | Raw | gzip | brotli -q11 | Loaded |
|---|---|---|---|---|
| `index-*.js` (app shell) | 490.9 KB | 159.7 KB | 139.3 KB | every route, before first render |
| `Scene-*.js` (3D, lazy) | 1,097.8 KB | 295.8 KB | 244.6 KB | home only, after the shell renders |
| `index-*.css` | 38.0 KB | 9.1 KB | n/a | every route |
| `reeng_ring.glb` (Draco) | 80.0 KB | n/a | n/a | preloaded on **every** route (`index.html`) |
| Draco decoder (`draco_wasm_wrapper.js` + `.wasm`) | 58 KB + 192 KB | n/a | n/a | home, before the ring can render |
| Fonts (latin subsets: Unbounded 50.9 KB, Geist 29.4 KB, Geist Mono 23.1 KB) | about 103 KB | n/a | n/a | on first use (`font-display: swap`) |

Vite warns that `Scene-*.js` is over 500 KB.

**What's inside the chunks** (minified bytes attributed through source maps):

| `index-*.js` | KB | `Scene-*.js` | KB |
|---|---|---|---|
| react-dom | 202 | three (core + module) | 560 |
| gsap + ScrollTrigger | 111 | @react-three/fiber (includes react-reconciler) | 165 |
| react-router | 92 | three-stdlib, of which: | 101 |
| app code | 41 | · GLTFLoader | 43 |
| lenis | 18 | · MeshoptDecoder (already bundled by `useGLTF`) | 19 |
| react | 8 | · **EXRLoader + RGBELoader** (unused, pulled in by `<Environment>`) | 21 |
| | | **@monogrid/gainmap-js** (unused, pulled in by `<Environment>`) | 16 |
| | | app scene code | 36 |
| | | drei itself (tree-shaken well) | 9 |

Takeaways:
- drei tree-shakes fine. The only dead weight is the about 37 KB min (about 12 KB gz) of HDR/EXR/gainmap loaders that `<Environment>` imports even though the scene only uses Lightformers.
- three plus R3F (about 725 KB min, 245 KB brotli) is the floor for a real-time scene. You can't shrink it much, but you can stop it from blocking anything.
- The shell is 160 KB gz of JS that must run before the hero `<h1>` exists, because `index.html` has an empty `#root`. **That is the biggest LCP problem, and it isn't a 3D problem.**

### Runtime probe (dev build, M2, 449×858 CSS px viewport at DPR 2)

| Metric | Value |
|---|---|
| Canvas backing store | 898×1716 (DPR 2, `antialias: true`, MSAA) |
| Objects in scene graph | 73 meshes/points/lines, 73 materials, 60 geometries, 7 canvas textures |
| Physical materials | 8 meshes (`MeshPhysicalMaterial`), 1 with `transmission` (Water bubbles) |
| Triangles in graph | about 93k total. The ring GLB is 23.9k verts / 35.9k tris and is drawn twice (main ring + compare clone). |
| Draw calls per frame by section | hero 5 · tap 13 · cross-chain **23** · how 7 · security 13 · specs 11 · order 5 · ecosystem 8 · compare 0 · FAQ 0 |
| Frame loop | `always`: about 60 fps of renders and every `useFrame` callback, even in Compare/FAQ, where **0 draw calls** happen |

Draw calls and triangles are already well inside mobile budgets (§6). On low-end hardware this scene will be **fill-rate- and main-thread-bound**, not draw-call-bound. Fill rate comes from DPR × MSAA × physical/transparent materials. The main thread carries the shell JS, per-frame layout reads and GC from per-frame allocations.

### Code-level findings that matter for low-end devices
1. `src/scene/layout.ts`: `layout()` builds about 20 `Vector3`s plus nested objects per call, and it's called from about 10 `useFrame`s, so roughly **200 allocations per frame**. This is the exact GC-pressure pitfall in the [R3F pitfalls doc](https://r3f.docs.pmnd.rs/advanced/pitfalls).
2. `src/scene/CompareModels.tsx`: calls `getBoundingClientRect()` on 4 elements **every frame on every section**, not only near Compare.
3. `src/scene/Backdrop.tsx`: writes `el.style.backgroundColor` every frame (a string allocation plus a style invalidation), even when the colour hasn't changed.
4. `src/scene/Terminal.tsx` and `src/scene/Coins.tsx`: each has a `pointLight` inside a group that's toggled with `visible`. three.js keys shader programs on the **number of lights**, so the first time the light count changes, every lit material on screen compiles a new program variant. That's a hitch on first entry to Tap and Cross-chain. My dev probe saw no new `linkProgram` calls while scrolling after load, but the patch went in after the scene started, so treat that as **inconclusive**. Verify with r3f-perf (§6).
5. `src/scene/Water.tsx`: the bubbles use `transmission: 0.6`, which makes three render an extra transmission pass of the scene every frame they're visible. That's expensive on a Mali GPU for a tiny effect.
6. `Canvas dpr={[1, 2]}` with `antialias: true`: a DPR-2.75 Android phone renders at 2× with 4× MSAA on top. No tiering, no adaptive DPR, no `PerformanceMonitor`.
7. `Suspense fallback={null}`: nothing stands in for the ring until three + R3F + Draco + GLB are all ready. There's no poster and no no-WebGL fallback.
8. `index.html` preloads the GLB on every route, including `/checkout`, where it's never used.
9. Good already: scroll state lives in a plain mutable object (no React re-renders), most `useFrame` math reuses module-level `Vector3`/`Quaternion`s, canvas textures are redrawn only when their content key changes, the Scene chunk is lazy, objects are toggled with `visible` rather than mounted and unmounted ([R3F pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) recommends exactly this), and Lenis runs off the GSAP ticker as its README recommends.

---

## 1. Loading

### 1.1 Get the hero text out of JavaScript (LCP)
- LCP "good" is ≤ 2.5 s at the 75th percentile of field data ([web.dev thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)). On a mid-range Android phone over 4G, 140 KB brotli of shell JS has to download, parse and run before the `<h1>` exists. That alone can eat most of the budget.
- **Do:** prerender the home route's HTML at build time, at least the hero section, so the LCP element (the `<h1>` tagline) is in the first HTML response. Options: react-router's framework-mode prerendering, or a small build step that runs `renderToString(<Home/>)` into `index.html`. If neither suits, hand-inline the hero markup in `index.html` and let React take over. The 3D canvas stays client-only either way.
- Keep the hero **text-first**: the ring is decoration and must never be the LCP element. A `<canvas>` doesn't count as an LCP candidate, but a poster `<img>` would, so give the poster a small size and `fetchpriority="low"` or make it a CSS background.

### 1.2 Fonts
- Late font discovery is the usual cause of text-LCP delay. A `<link rel="preload" as="font" type="font/woff2" crossorigin>` in the head makes the font load in parallel with the CSS ([DebugBear](https://www.debugbear.com/blog/preload-web-fonts)). Preload *only* the font(s) used by the hero, because over-preloading dilutes the benefit ([web.dev preload](https://web.dev/preload-critical-assets/)).
- Fontsource already uses `font-display: swap` and `unicode-range`, so only the latin files download. **Do:** preload `unbounded-latin-wght-normal.woff2` (50.9 KB, the `<h1>` face) and maybe Geist latin. Don't preload Geist Mono: it's only used for labels and canvas textures. Check in DevTools that the 118 KB `unbounded-latin-ext` file never downloads. It would only load if a glyph outside basic latin appears.
- `swap` can cause CLS when the fallback metrics differ ([web.dev font best practices](https://web.dev/font-best-practices/)). Add `size-adjust`/`ascent-override` fallback faces for Unbounded, which is a wide face, so the swap doesn't reflow the hero.
- Canvas textures (`labelTexture.ts` etc.) already redraw on `document.fonts.ready`, which is correct. It does mean those textures upload twice. That's fine.

### 1.3 Bundle splitting for three / R3F / drei
- **Stop the 1.1 MB Scene chunk from being one blob.** Split it into `three` (changes only on upgrade), `r3f` and app-scene chunks so a scene code change doesn't invalidate 245 KB brotli of cached three. In Vite 8 (Rolldown) that's `build.rolldownOptions.output.codeSplitting.groups` with a `test` regex per group. `manualChunks` is deprecated in Rolldown and ignored if both are set ([Rolldown codeSplitting](https://rolldown.rs/reference/OutputOptions.codeSplitting), [manualChunks](https://rolldown.rs/reference/outputoptions.manualchunks)). Keep gsap/lenis in the shell, since the sections need them.
- **Drop the Environment loaders (about 37 KB min):** replace drei `<Environment>` + `<Lightformer>` with a tiny custom component that builds the same 5 emissive planes in a private `Scene` and calls `PMREMGenerator.fromScene()` once. That's what drei does internally for children: it films "a single frame" with a cube camera ([drei Environment](https://drei.docs.pmnd.rs/staging/environment)). Or bake it once offline into a small gainmap `.webp`/`.jpg`, which drei calls the format with "the smallest footprint" ([same page](https://drei.docs.pmnd.rs/staging/environment)), and load that with a single loader.
- **R3F tree-shaking:** since v8 the reconciler only knows the classes you `extend`, and drei imports are per-component, so there's little left to gain ([R3F Canvas docs](https://r3f.docs.pmnd.rs/api/canvas)). The docs note that using `createRoot` directly instead of `<Canvas>` can save about 40 KB of react-dom plus `react-use-measure` and pointer-events ([same](https://r3f.docs.pmnd.rs/api/canvas)). react-dom is already in the shell here, so the real saving is about 10 KB. Not worth it.
- `@react-three/postprocessing` is in `package.json` but not imported anywhere, so it isn't bundled. Keep it that way unless it's needed (§2.10).

### 1.4 Lazy-mounting the canvas: when to start
- The Scene chunk currently starts downloading as soon as `App` renders, so it competes with fonts and the LCP. **Do:** start the `import()` after first paint and only for capable tiers: `requestIdleCallback` (with a `setTimeout` fallback), gated on the tier check in §3. The hero must look finished without it.
- Add `<link rel="modulepreload">` for the three/R3F chunks only after LCP (inject it from JS), not in the static head.
- Move the `<link rel="preload" href="/models/reeng_ring.glb">` out of `index.html` (it runs on every route) and trigger it from the home route alongside the Scene import, or keep it with `fetchpriority="low"`.

### 1.5 GLB: Draco vs Meshopt vs quantization; KTX2
- Third-party guides agree that Draco usually gives the smallest geometry but decodes slower and needs a much larger decoder. Meshopt decodes faster and handles animation and morph targets. `KHR_mesh_quantization` needs no decoder at all ([cinevva GLB guide](https://app.cinevva.com/guides/optimize-glb-for-web), [A-Frame docs](https://aframe.io/docs/1.7.0/components/gltf-model.html)). Verify on your own file. The cited ratios vary widely.
- **For this ring specifically:** the GLB is 80 KB with no textures. The Draco decoder costs **250 KB (wrapper + wasm) and a worker spin-up** before the ring can appear. `MeshoptDecoder` is **already in the Scene bundle** (19 KB, `useGLTF` imports it). Re-encode with gltf-transform using `meshopt` (plus quantization) and you'll likely trade a slightly bigger GLB for no Draco download and a faster decode. Measure both:
  ```bash
  npx @gltf-transform/cli meshopt reeng_ring.glb reeng_ring.meshopt.glb --level medium
  npx @gltf-transform/cli inspect reeng_ring.meshopt.glb
  ```
  ([gltf-transform CLI](https://gltf-transform.dev/cli)). Then drop `/draco/` from `public/` and the second `useGLTF` argument.
- The ring has 35.9k triangles, drawn twice. Compare cells show it at about 100 px, so a **decimated LOD** of about 8k triangles for `CompareModels` is free quality-wise (gltf-transform `simplify`, or Blender Decimate as in [Codrops: Efficient Three.js Scenes](https://tympanus.net/codrops/?p=86572)).
- **KTX2/Basis** only matters once the model gets image textures. KTX2 stays compressed on the GPU and typically uses 4–8× less VRAM than decoded PNG/JPEG ([Utsubo 100 tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)). If baked textures are added later: KTX2 (`etc1s` for colour, `uastc` for normals), at most 1024 px for this object.
- `gltf-transform optimize` defaults `--texture-compress auto`, which can grow PNGs, so pass `webp` or `ktx2` explicitly ([cinevva](https://app.cinevva.com/guides/optimize-glb-for-web)).

### 1.6 Poster / static fallback before 3D is ready
- Render a static `<picture>` (AVIF/WebP, about 30–60 KB) of the ring in its exact hero pose, at the same screen position as the 3D hero ring (`layout().hero`). Crossfade it out on the **first rendered frame** (a `useFrame` that runs once, after warm-up in §2.6), not on `onCreated`.
- The same image set doubles as the lite/no-WebGL experience (§3.4).
- This is also how [Ridgeline](https://daily.dev/posts/building-ridgeline-engineering-a-real-time-3d-experience-in-webflow-p6ebijkqs) avoided first-paint flashes: synchronous head CSS plus a 3D layer that appears only once ready.

---

## 2. Runtime

### 2.1 Frame loop: `always` vs `demand` vs driving it yourself
- `frameloop="demand"` renders only when props change or `invalidate()` is called. Mutations React can't see need a manual `invalidate()` ([R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)). This scene mutates everything in `useFrame`, so pure `demand` needs an explicit "keep rendering while…" rule.
- **Recommended pattern here:** `frameloop="never"`, with R3F's `advance(timestamp)` called from the **GSAP ticker right after `lenis.raf()`** (in `useSmoothScroll.ts`). That gives:
  1. **One rAF loop instead of two.** Today Lenis/ScrollTrigger and R3F each have their own, and their order within a frame isn't guaranteed. DOM and WebGL would read the same scroll value in the same frame.
  2. A single place to **skip frames**: don't call `advance` when (a) no scene object is visible (Compare, FAQ, footer: measured 0 draw calls), (b) the page hasn't scrolled and every damped value has settled, or (c) the tab is hidden. A `needsFrame` flag set by Lenis `scroll` events, plus a "still damping" flag from `RingRig`/`RingFx` while `|target - current| > ε`, is enough. Keep a slow idle rate (for example 30 fps) only for sections with idle motion (hero spin, bubbles, coin orbit).
- Hidden tabs already pause rAF in most browsers ([MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)). You still want to stop work while the canvas shows nothing, which is the main battery and heat saver on phones.
- Chrome Energy Saver and Safari Low Power Mode lower the rAF rate. Lenis notes Safari is capped at 60 fps, and at 30 fps in low-power mode ([Lenis README](https://cdn.jsdelivr.net/gh/darkroomengineering/lenis@1.3.26/README.md)), and rAF-based animation "will automatically adjust" in Energy Saver ([Chrome blog](https://developer.chrome.com/blog/memory-and-energy-saver-mode)). Everything must be **delta-time based**, never fixed per-frame steps ([R3F pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)). `RingRig`'s `MathUtils.damp(..., dt)` is already correct.

### 2.2 DPR: cap it, then adapt
- R3F's default is `dpr={[1, 2]}` ([Canvas docs](https://r3f.docs.pmnd.rs/api/canvas)). Phones that report DPR 3 have 9× the pixels of a 1× screen ([Utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips)).
- **Do:** set the max DPR per tier: tier 3 → 2, tier 2 → 1.5, tier 1 → 1. Then let drei `PerformanceMonitor` move within that range. Its defaults: 250 ms samples × 10 iterations, a 0.75 threshold, `bounds` from the refresh rate, `onIncline`/`onDecline`/`onChange(factor)`, and `flipflops` + `onFallback` to stop ping-ponging ([drei PerformanceMonitor](https://drei.docs.pmnd.rs/performances/performance-monitor)). Use `onChange` with `factor` to set `dpr = min + (max - min) * factor` via `setDpr`. On `onFallback`, lock to the low DPR.
- `AdaptiveDpr` lowers the pixel ratio on `regress()` according to the Canvas `performance` min/max ([drei AdaptiveDpr](https://drei.docs.pmnd.rs/performances/adaptive-dpr)). Regress is designed for camera-control movement, and `regress()` does nothing unless something reads `performance.current` ([R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)). In a scroll-driven page you could call `regress()` on Lenis scroll for "lower res while scrolling fast". That's optional. `PerformanceMonitor` is the more important piece.
- `AdaptiveEvents` disables raycasting during regress. This canvas is `pointer-events-none` with no R3F events, so it's not needed. You could also pass `events={undefined}`/no event manager to skip the pointer plumbing.

### 2.3 Antialiasing
- MSAA at DPR ≥ 2 is mostly wasted fill rate. **Do:** create the context with `antialias: dpr < 1.5 && tier >= 2`. MSAA can't be toggled after context creation, so decide before mounting the Canvas. At DPR 1 on old laptops, a cheap edge solution matters more. If postprocessing is ever added, turn native MSAA off and use SMAA/FXAA in the composer, with `multisampling={0}` ([Utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips)).
- Set `powerPreference: 'high-performance'` (R3F's default) on laptops with dual GPUs. Leave it as is.

### 2.4 Draw calls, instancing, merging
- R3F guidance: each mesh is a draw call, so stay under about 1000, ideally a few hundred ([R3F scaling](https://r3f.docs.pmnd.rs/advanced/scaling-performance)). For mobile, the often-quoted target is "<100 draw calls and <100,000 vertices" ([Utsubo quoting Don McCurdy](https://www.utsubo.com/blog/threejs-best-practices-100-tips)).
- **Measured 5–23 per section, so this isn't a problem.** The worst section is Cross-chain (23), with 6 coins × 2–3 materials. If it grows, make the coins one `InstancedMesh` for the edge plus one for the caps (all faces in one atlas texture). Water bubbles are already instanced.
- Share materials and geometries. Every material compiles a program, and `useMemo`/module scope sharing avoids duplicates ([R3F pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)). The scene has 73 materials for 73 objects. Many `meshBasicMaterial`s differ only in colour and opacity. They share *programs* (same shader), so the cost is small, but prefer shared instances where opacity isn't animated per object.

### 2.5 Avoid per-frame allocations and DOM reads
- From the [R3F pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) doc: don't create `Vector3`s every frame, don't `setState` in `useFrame`, and read fast-changing state imperatively.
- **Fix `layout()`:** memoize on `(vw, vh)`, for example a module-level cache keyed by `${vw}|${vh}`, so it allocates only on resize. That removes about 200 allocations a frame. Low-end Android GC pauses are where scroll "micro-stutter" comes from.
- **Fix `Backdrop`:** keep the last `paper` value and only write the style when it changes by more than about 0.002. Precompute the hex.
- **Fix `CompareModels`:** read rects only while the Compare section is near the viewport (gate it with an IntersectionObserver flag or the ScrollTrigger progress you already have). Better still, compute positions from the cached element offset (`offsetTop` cached on resize) plus `lenis.scroll`, with no layout read per frame.
- Minor: `RingFx` uses `Object.entries(parts)` plus a `traverse` closure per frame. Cache the entries and mesh lists once.

### 2.6 Shader/material warm-up
- First-time rendering of a new material or light combination compiles a shader, which causes "shader compilation stutter". `renderer.compileAsync(scene, camera, targetScene?)` precompiles and returns a Promise, and uses `KHR_parallel_shader_compile` where available ([three.js WebGLRenderer docs](https://threejs.org/docs/pages/WebGLRenderer.html), [three.js PR #19752](https://github.com/mrdoob/three.js/pull/19752)). Ridgeline removed a roughly 1 s compile freeze this way ([Ridgeline case study](https://daily.dev/posts/building-ridgeline-engineering-a-real-time-3d-experience-in-webflow-p6ebijkqs)).
- Caveats: compile only covers *visible* objects. Forum reports say texture and geometry uploads cause part of the first-render stutter, which `compileAsync` doesn't cover ([three.js forum](https://discourse.threejs.org/t/reduce-first-render-lag-renderer-compileasync-is-not-doing-anything/86191)). There are also cache-key mismatches if `toneMapping`/`outputColorSpace` change around the call ([forum](https://discourse.threejs.org/t/webglrenderer-compile-async-and-possible-wrong-shader-cache-key/89007)). Safari's parallel compile may still block ([WebKit bug](https://119184-bug-83566-attachments.webkit.org/show_bug.cgi?id=251514)).
- **Do (one `Warmup` component inside the Canvas):**
  1. After the GLB resolves, temporarily set every section root to `visible = true`.
  2. `await gl.compileAsync(scene, camera)`.
  3. Call `gl.initTexture(t)` for each of the 7 canvas textures. The phone screen alone is 600×1280, about 3 MB uploaded.
  4. Restore visibility, then reveal the canvas and fade out the poster (§1.6).
- **Fix the light-count variants first:** move the Terminal and Coins `pointLight`s out of the toggled groups so they're *always* in the scene (intensity 0 when unused). The light count then never changes and no second program variant is ever needed. three's program cache key includes the number of lights. Alternatively, drop the point lights entirely and fake the glow with an additive sprite or emissive, which is cheaper on mobile.

### 2.7 Unmount vs `visible = false`
- The R3F docs advise keeping things mounted and toggling `visible`, because mounting recompiles materials and re-uploads buffers ([pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)). The current design does this, and it's right for this site's size (73 objects, about 93k triangles total, 7 small canvas textures).
- When to reconsider: if a section later adds heavy assets (a large textured model, video textures), load them **lazily on approach** (one section ahead) and keep them mounted afterwards. Don't unmount on exit.
- Hidden objects still cost their `useFrame` callbacks. All of them early-return when hidden, which is correct. Keep that discipline.

### 2.8 Environment and lighting cost
- `<Environment resolution={256}>` with Lightformer children renders the cube once and PMREMs it ([drei Environment](https://drei.docs.pmnd.rs/staging/environment)). It's not per-frame unless `frames` is set. Runtime cost is a one-off, but it's a few ms of GPU work at start-up plus the dead loaders in §1.3.
- **Options:** (a) keep the runtime build but in a hand-rolled component (bundle saving), or (b) bake to a gainmap/HDR once and ship about 20–60 KB. For tier 1, use `resolution={128}`.
- No shadows are enabled (`Canvas` has no `shadows` prop), although `Ring.tsx` sets `castShadow = true`, which is harmless. Keep shadows off. If a contact shadow is wanted, bake it to a texture. A point-light shadow re-renders the scene 6 times ([Utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips)).

### 2.9 Materials and fill rate (the real low-end cost here)
- `MeshPhysicalMaterial` with clearcoat (ring shell, water surface) is the most expensive standard material per pixel. The **water surface** is a 9×5 transparent plane covering much of the screen during Specs. On tier 1, use `MeshStandardMaterial` (no clearcoat) for the water and keep physical only on the ring shell.
- **Remove `transmission` from the bubbles** on all tiers. A transparent standard material with a fresnel-ish rim looks the same at bubble size and avoids an extra transmission render pass.
- Transparent, overlapping full-screen planes (water surface + depth plane) multiply overdraw. Keep them only while needed (already gated by `visible`).

### 2.10 Canvas textures
- Fine as built: small sizes (256² to 600×1280), redrawn only on content-key change, `anisotropy = 4`. Two improvements:
  - Upload them during warm-up (§2.6), not on first visibility.
  - On tier 1, draw them at half resolution (render the canvas at 0.5×). Text stays readable at mobile on-screen sizes.

### 2.11 Post-processing
- None today. If bloom or a glow is added later: every full-screen pass multiplies fill cost on exactly the devices that struggle. Render effects at half resolution, merge them into one pass, and set `multisampling={0}` ([Utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips)). Ridgeline removed unnecessary MSAA on post passes to hit 60 fps ([Ridgeline](https://daily.dev/posts/building-ridgeline-engineering-a-real-time-3d-experience-in-webflow-p6ebijkqs)). For this site, fake glow with emissive plus additive sprites, and disable it on tier ≤ 1.

---

## 3. Tiering

### 3.1 Signals
| Signal | Use | Notes |
|---|---|---|
| WebGL2 context creation | hard gate | No context means the static experience |
| `@pmndrs/detect-gpu` `getGPUTier()` | primary tier | Tier 0 if no WebGL, blocklisted or below 15 fps; tier 1 ≥ 15, tier 2 ≥ 30, tier 3 ≥ 60 fps. `type` = `BENCHMARK`, `FALLBACK` or `BENCHMARK_FETCH_FAILED`. Benchmarks load from UNPKG by default, so **self-host** via `benchmarksURL`. The gfxbench data source stopped updating in Dec 2025, so new GPUs come back as `FALLBACK` ([detect-gpu README](https://cdn.jsdelivr.net/npm/@pmndrs/detect-gpu@6.0.15/README.md)). The package moved from `detect-gpu` to `@pmndrs/detect-gpu`. |
| `navigator.deviceMemory` | tie-breaker | Approximate GB, clamped for privacy, Chromium-only, secure context ([MDN Device Memory](https://developer.mozilla.org/docs/Web/API/Navigator/deviceMemory)). ≤ 2 means tier 1 at most. |
| `navigator.hardwareConcurrency` | tie-breaker | ≤ 4 cores plus a mobile UA means cap at tier 2 |
| `navigator.connection.saveData` | lite | Respect it: no 3D download |
| `prefers-reduced-motion: reduce` | motion mode | See §3.3 |
| `navigator.getBattery()` | optional | Not Baseline (Chromium only), secure context, can be blocked by Permissions-Policy ([MDN Battery Status](https://developer.mozilla.org/docs/Web/API/Battery_Status_API)). Use only as a hint (charging = false and level < 0.2 means drop one tier). |
| Runtime FPS (`PerformanceMonitor`) | the final truth | Static detection is a guess, and runtime measurement corrects it (§2.2) |

### 3.2 Tiers for this site
| Tier | Who | 3D | DPR max | AA | Materials | Extras |
|---|---|---|---|---|---|---|
| 3 | Apple Silicon, recent dGPU | full | 2 | MSAA if DPR < 1.5 | as designed | Env 256 |
| 2 | Recent iGPU, flagship/upper-mid phones | full | 1.5 | off | bubbles without transmission | Env 256 |
| 1 ("lite") | Old iGPU (UHD 620), mid/low Android, `deviceMemory ≤ 2` | full choreography, cheaper | 1 | off | no clearcoat on water, canvas textures at half res, no splash points, compare models use the LOD ring | Env 128, 30 fps idle cap |
| 0 / no WebGL / save-data | Very low-end, blocklisted, WebGL fails | **none** (Scene chunk never downloaded) | n/a | n/a | n/a | static posters per section (§3.4) |

Run detection **before** importing the Scene chunk (detect-gpu is small), so tier-0 users never download about 245 KB brotli of three.

### 3.3 Reduced motion
- Today `useSmoothScroll` disables Lenis when reduced motion is set, but the 3D choreography still flies and spins. Lenis 1.3 already handles reduced motion itself: `respectReducedMotion` defaults to true, forces `lerp = 1` and makes programmatic scrolls jump ([Lenis README](https://cdn.jsdelivr.net/gh/darkroomengineering/lenis@1.3.26/README.md)). You can keep one code path.
- For the 3D: stop idle spins and sways, replace flights between poses with crossfades or short opacity transitions, and keep the scroll-linked *state* changes (phase text, screen content). The story stays intact without motion.

### 3.4 Static fallback
- Apple's well-known scroll-scrubbed product pages (AirPods Pro and others) don't render 3D in real time. They draw a pre-rendered **image sequence onto a `<canvas>`**, picking the frame from scroll position, which avoids video seeking lag ([CSS-Tricks](https://css-tricks.com/?p=308477), [GSAP forum thread](https://gsap.com/community/forums/topic/25188-airpods-image-sequence-animation-using-scrolltrigger/)). That buys predictable cost on any device, at the price of heavy downloads, no interactivity and no configurator colour changes.
- For Reeng, a full image sequence across 13 sections would be several MB, so it's not worth it. **Do:** one Blender-rendered still (or short looping `<video>`) per pinned section for tier 0. The section copy is already DOM and fully readable without the canvas. The renders already exist as the design reference ("matching the Blender renders" in `Scene.tsx`).
- Also handle `webglcontextlost`: swap to the posters instead of showing a frozen canvas.

---

## 4. Scroll

### 4.1 Lenis + ScrollTrigger
- The current setup matches the official recipe (`lenis.on('scroll', ScrollTrigger.update)`, `lenis.raf` in `gsap.ticker`, `lagSmoothing(0)`) ([Lenis README](https://cdn.jsdelivr.net/gh/darkroomengineering/lenis@1.3.26/README.md)). `lagSmoothing(0)` is global for GSAP. That's fine here.
- Lenis `syncTouch` defaults to false, so **phones keep native touch scrolling**, which is what you want on low-end Android ([Lenis README](https://cdn.jsdelivr.net/gh/darkroomengineering/lenis@1.3.26/README.md)). Don't enable it.
- Known costs and limits: `position: fixed` lags on pre-M1 macOS Safari, and `allowNestedScroll` walks the DOM on every scroll event ([same](https://cdn.jsdelivr.net/gh/darkroomengineering/lenis@1.3.26/README.md)). The fixed canvas is exactly that case on old Intel Macs. Test there.
- About 30 ScrollTriggers (3 per section) is cheap. Each `onUpdate` writes a number, and `setPhase` only re-renders when the discrete phase changes (React bails out on equal state).
- `ResizeObserver` → `ScrollTrigger.refresh()` (debounced 120 ms) is correct. On mobile, also set `ScrollTrigger.config({ ignoreMobileResize: true })` so the address bar showing and hiding doesn't trigger refreshes. The sections already use `svh`, which helps.

### 4.2 Keep DOM and WebGL in sync cheaply
- Use one clock: advance R3F from the GSAP ticker after Lenis (§2.1). Then ScrollTrigger writes `scrollState`, and R3F reads it in the same tick, with no 1-frame drift between DOM copy and 3D.
- No per-frame layout reads (§2.5). Cache element offsets on `refresh` and compute screen positions from `lenis.scroll`.
- Never interleave style writes and layout reads in one frame. `Backdrop` writes a style, then `CompareModels` reads rects, which forces a synchronous style recalc each frame.

### 4.3 `will-change` and compositing
- MDN calls `will-change` a "last resort", and overuse wastes memory ([MDN will-change](https://developer.mozilla.org/docs/Web/CSS/will-change)). The fixed canvas is already its own compositor layer. Don't add `will-change` to sections or text.
- Animate only `transform` and `opacity` on DOM. The backdrop colour fade (`background-color` on the canvas wrapper) triggers a repaint of a full-screen layer every frame while it changes. That's acceptable, but it's cheaper to clear the WebGL canvas to that colour (`gl.setClearColor`) and drop the DOM background write entirely.

---

## 5. Newer options: worth it here?

### WebGPU (`three/webgpu`, `WebGPURenderer`)
- Status in 2026: WebGPU ships in Chrome/Edge (desktop since 113, Android 12+ since 121), Safari 26 (macOS/iOS 26) and Firefox (Windows since 141, Apple Silicon later). Linux/Android Firefox coverage is unclear ([web.dev](https://web.dev/blog/webgpu-supported-major-browsers), [Wikipedia](https://en.wikipedia.org/wiki/WebGPU)). Chrome added a compatibility mode for older GLES 3.1 Android devices in Feb 2026 (per the [Khronos SIGGRAPH 2026 deck](https://www.khronos.org/developers/linkto/webgl-and-webgpu-sigg26)).
- `WebGPURenderer` falls back to a WebGL2 backend automatically ([three.js manual: WebGPURenderer](https://threejs.org/manual/#en/webgpurenderer)). It needs `await renderer.init()` or `setAnimationLoop`. Skipping it gives a black canvas with no error ([buildmvpfast](https://www.buildmvpfast.com/blog/threejs-webgl-to-webgpu-renderer-migration-2026)). Custom shaders must be TSL. One write-up reports a Firefox/Linux black-canvas case ([same](https://www.buildmvpfast.com/blog/threejs-webgl-to-webgpu-renderer-migration-2026)). "WebGPU is not universally faster" ([Utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips)).
- **Verdict: no.** This scene is fill- and main-thread-bound with ≤ 23 draw calls. WebGPU's wins (lower CPU per draw call, compute) don't apply, the `three/webgpu` build is larger, and the low-end devices you care about are the ones most likely to land on the fallback path anyway. Revisit only if you add GPU particle systems or compute.

### OffscreenCanvas / `@react-three/offscreen`
- Still described as "experimental". Safari uses the main-thread fallback, and scenes should be "self contained" with no DOM access ([react-three-offscreen README](https://github.com/pmndrs/react-three-offscreen)).
- **Verdict: no.** This scene reads the DOM every frame (`getBoundingClientRect` for Compare, `anchors.backdrop` style) and is driven by main-thread ScrollTrigger state, so all of that would have to be proxied with `postMessage`. Main-thread rendering cost is small once §2.5 is fixed, and iOS gets no benefit.

---

## 6. Measurement

### Tools
| Tool | Use it for |
|---|---|
| **Chrome DevTools Performance** (CPU 4×/6× throttle, "Slow 4G") | Long tasks at start-up (JS parse, Draco, shader compile, PMREM), GC sawtooth while scrolling (verifies the `layout()` fix), forced style/layout (purple bars from `getBoundingClientRect`) |
| **Real device + `chrome://inspect`** | A mid-range Android (for example a Galaxy A-series) is the only honest fill-rate test. Throttling the CPU doesn't simulate a weak GPU. |
| **r3f-perf** | In-canvas FPS, GPU time, memory, programs and textures, with `deepAnalyze` for GL programs ([r3f-perf](https://npmjs.com/package/r3f-perf)). Mount it lazily behind `?perf`. Watch the **programs count while scrolling**: it must not grow after warm-up. |
| **stats-gl** | CPU and **GPU timing** via timer queries (`trackGPU: true`). Safari needs the WebKit Timer Queries flag ([stats-gl README](https://cdn.jsdelivr.net/npm/stats-gl@4.2.3/README.md)) |
| **Spector.js** | Capture one frame: every draw call, state change, texture and shader ([Spector.js](https://github.com/BabylonJS/Spector.js), [author's intro](https://www.realtimerendering.com/blog/?p=4531)). Use it on Cross-chain (23 calls) and Specs (water) |
| **`renderer.info`** | `render.calls`, `render.triangles`, `memory.textures/geometries`, `programs.length`. These should stay flat over a full scroll ([Utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips)) |
| **Lighthouse / PageSpeed (mobile)** | LCP/TBT/CLS for the shell. Lab only. Field data is CrUX at p75 ([web.dev](https://web.dev/articles/defining-core-web-vitals-thresholds)). Lighthouse's emulated GPU makes its 3D numbers meaningless, so judge the shell, not the scene. |

Add a dev-only `window.__reeng.gl = gl` (next to the existing `__reeng` handle) so `renderer.info` can be read from the console.

### Budgets for this site
| Budget | Target | Current |
|---|---|---|
| Shell JS (blocks LCP) | ≤ 100 KB brotli, and the hero must not depend on it (prerendered) | 139 KB br, hero depends on it |
| 3D JS (deferred) | ≤ 250 KB brotli total, split for caching | 245 KB br, one chunk |
| GLB + decoders before the first ring frame | ≤ 150 KB | 80 KB GLB + 250 KB Draco |
| Hero fonts | 1 preloaded woff2, ≤ 60 KB | 0 preloaded |
| LCP (p75 mobile) | ≤ 2.5 s | unmeasured, at risk |
| CLS | ≤ 0.1 (font swap!) | unmeasured |
| Draw calls per frame | ≤ 50 (mobile ≤ 100) | 5–23 ✓ |
| Visible triangles | ≤ 100k mobile | ≤ about 72k ✓ (two rings) |
| Shader programs after warm-up | constant | verify |
| Frame time | 16.7 ms at 60 Hz on tier 2; ≤ 33 ms (steady 30) on tier 1. JS in `useFrame` ≤ 2 ms | unmeasured on low-end |
| GC | no major GC during a continuous scroll | about 200 allocs/frame today |
| Canvas textures (VRAM) | ≤ 16 MB total | about 7 small, fine |

---

## 7. What other sites do

- **Apple product pages:** pre-rendered image sequences on canvas, or scrubbed video, not real-time 3D, for predictable performance ([CSS-Tricks](https://css-tricks.com/?p=308477)). Lesson: the "wow" can be pre-rendered where interactivity isn't needed. For Reeng, the configurator colour, the exploded parts and scroll-reversible choreography justify real-time, but tier 0 should get Apple-style stills.
- **Ridgeline (Codrops case study, R3F + Webflow):** refs plus ScrollTrigger instead of React re-renders on scroll, `compileAsync` to kill a roughly 1 s freeze, frozen shadow maps, particle animation moved to the vertex shader, MSAA removed from post passes, and synchronous head CSS to avoid a first-paint flash ([summary](https://daily.dev/posts/building-ridgeline-engineering-a-real-time-3d-experience-in-webflow-p6ebijkqs)). Its theme, "performance is mostly not animating things", is the same as §2.1.
- **Codrops "Building Efficient Three.js Scenes" (SINGULARITY demo, R3F + drei, Feb 2025):** simplified models and low-res textures for distant or small objects, power-of-two textures, Blender clean-up and decimation before export ([Codrops](https://tympanus.net/codrops/?p=86572)). That maps directly to the compare-table LOD ring (§1.5).
- **Awwwards-level R3F sites** (for example the Igloo Inc landing page, [Awwwards case study](https://awwwards.com/igloo-inc-case-study.html)) typically pair a loader or intro screen (to hide compile, upload and decode) with a small number of heavily optimised scenes. Reeng shouldn't copy the loading screen. A marketing page must show text instantly, so use the poster swap instead (§1.6).

---

## 8. Prioritised action list (project-specific)

Impact: H/M/L on low-end devices. Effort: S (< 2 h), M (half to one day), L (> 1 day).

### Now (before more sections are built)
| # | Action | Where | Impact | Effort |
|---|---|---|---|---|
| 1 | Memoize `layout(vw, vh)` so it allocates only on resize | `src/scene/layout.ts` | **H** (GC stutter on Android) | S |
| 2 | Tier gate + DPR cap: run detect-gpu (self-hosted data) plus `deviceMemory`/`saveData` before `import('./scene/Scene')`. Tier 0 never loads 3D. Pass `dpr`/`antialias` from the tier. | `src/App.tsx`, `Scene.tsx` | **H** | M |
| 3 | `PerformanceMonitor` with `onChange` → `setDpr` within the tier range, `onFallback` → lock low | `Scene.tsx` | **H** | S |
| 4 | Stop rendering when nothing is visible or nothing moves: `frameloop="never"` + `advance()` from the GSAP ticker after `lenis.raf`, skipping when idle, hidden, or in Compare/FAQ/footer | `useSmoothScroll.ts`, `Scene.tsx` | **H** (battery, heat, throttling) | M |
| 5 | Move the Terminal/Coins `pointLight`s out of toggled groups (constant light count), or replace them with emissive/sprites | `Terminal.tsx`, `Coins.tsx` | M–H (first-entry hitch) | S |
| 6 | Remove `transmission` from the bubbles | `Water.tsx` | M | S |
| 7 | Gate `CompareModels` rect reads to when Compare is near. `Backdrop`: write only on change (or set the GL clear colour instead). | `CompareModels.tsx`, `Backdrop.tsx` | M | S |
| 8 | Split the Scene chunk (`three` / `r3f` / app) with `rolldownOptions.output.codeSplitting.groups` | `vite.config.ts` | M (repeat visits) | S |

### While building each section
| # | Action | Impact | Effort |
|---|---|---|---|
| 9 | Per-section check with r3f-perf: draw calls ≤ 50, programs constant after warm-up, no new allocations in `useFrame` (hoist every `new Vector3/Color/Quaternion`) | H (prevents regressions) | S per section |
| 10 | Every new `useFrame` early-returns when its root is hidden (current pattern). Keep toggling `visible` rather than mounting. Lazy-load any *heavy* new asset one section ahead and keep it mounted. | M | S |
| 11 | Repeated objects (coins, cards, particles) go into `InstancedMesh`. Coin faces go in one atlas. | M (Cross-chain is the heaviest at 23 calls) | M |
| 12 | Prefer `MeshStandard`/`Basic` over `Physical`. Physical (clearcoat) only on the ring shell. Provide a tier-1 material for any full-screen transparent plane. | M–H on Mali/Adreno | S |
| 13 | Canvas textures: keep content-keyed redraws, add each new texture to the warm-up list, and draw at 0.5× on tier 1 | L–M | S |
| 14 | Design each section's tier-0 still and reduced-motion variant (crossfade instead of flight) alongside the 3D version | M (accessibility, no-WebGL) | S per section |
| 15 | No post-processing by default. Any glow is emissive plus additive sprites, disabled on tier ≤ 1. | H if someone adds bloom | n/a |

### Before launch
| # | Action | Impact | Effort |
|---|---|---|---|
| 16 | Prerender the home hero HTML (react-router prerender or a `renderToString` build step) so LCP doesn't wait for 140 KB br of JS | **H** (LCP) | M–L |
| 17 | Preload the Unbounded latin woff2. Add metric-matched fallback `@font-face` (`size-adjust`) to prevent CLS on swap. | H (LCP/CLS) | S |
| 18 | Hero poster `<picture>` (AVIF/WebP) in the ring's hero pose, crossfaded out on the first real frame. Same assets serve tier 0 and `webglcontextlost`. | H (perceived load) | M |
| 19 | Warm-up component: make everything visible → `compileAsync` → `initTexture` for canvas textures → restore → reveal | M–H | S |
| 20 | Re-encode the GLB with Meshopt + quantization (MeshoptDecoder is already bundled) and drop `/draco/`. Add an about 8k-triangle LOD for `CompareModels`. Compare sizes and decode time first. | M (−250 KB before the first ring frame) | S |
| 21 | Replace drei `<Environment>` with a hand-rolled PMREM-from-scene (or a baked gainmap) to drop about 37 KB min of unused HDR/EXR/gainmap loaders | L–M | S |
| 22 | Start the Scene import after first paint (`requestIdleCallback`). Move the GLB preload out of `index.html` (it loads on `/checkout` etc.) and into the home route. | M | S |
| 23 | Reduced motion: let Lenis handle it (`respectReducedMotion`) instead of disabling it. Turn off idle spins and flights in the 3D. | M (accessibility) | S |
| 24 | Test matrix: an Intel-Mac Safari (fixed-canvas lag), a mid-range Android on Chrome (fill rate, DPR 2.75), an old Windows laptop with UHD 620, iOS Low Power Mode (30 fps), Chrome Energy Saver. Record r3f-perf/stats-gl numbers against the §6 budgets. | H (confidence) | M |
| 25 | `ScrollTrigger.config({ ignoreMobileResize: true })`. Confirm no `will-change` spam in the CSS. | L | S |

**Biggest wins for the least work:** #1, #3, #5, #6, #7 (all S). **Biggest wins overall:** #2 + #4 (runtime on low-end) and #16 + #17 + #18 (load and LCP).
