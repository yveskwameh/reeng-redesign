import { Environment, Lightformer } from '@react-three/drei'
import { HeroShadow } from './HeroShadow'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { wash } from '../components/ecosystem'
import { modes } from '../content/ecosystem'
import { PLACES } from '../content/places'
import { Backdrop } from './Backdrop'
import { CameraRig } from './CameraRig'
import { CompareModels } from './CompareModels'
import { Coins } from './Coins'
import { Envelope } from './Envelope'
import { SpecCallouts } from './SpecCallouts'
import { Water } from './Water'
import { SecuritySpots } from './SecuritySpots'
import { RingRig } from './RingRig'
import { anchors, SPEC_WATER } from './scrollState'
import { RingFx } from './RingFx'
import { Terminal } from './Terminal'

/**
 * One persistent canvas fixed behind the page. Sections drive the ring
 * through scroll (see scrollState.ts) rather than mounting their own canvases.
 */
export function Scene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-white">
      {/* hero wordmark: under the transparent canvas so the ring floats in front of it */}
      <div
        ref={(el) => void (anchors.heroWord = el)}
        aria-hidden
        className="absolute inset-x-0 top-1/2 select-none whitespace-nowrap text-center font-display font-bold leading-none text-mist"
        style={{ fontSize: 'clamp(6rem, 26vw, 28rem)', letterSpacing: '-0.06em', translate: '0 -50%' }}
      >
        REENG
      </div>
      {/* specs: the water behind the ring (the surface band fading back, then the body); the
          section draws the tint in front of it */}
      <div
        ref={(el) => void (anchors.specWater = el)}
        aria-hidden
        className="absolute inset-x-0"
        style={{ visibility: 'hidden', background: `linear-gradient(to bottom, #F4F1FF00 0, #EEEAFE ${SPEC_WATER.band}px, #DCD5FB 100%)` }}
      />
      {/* order: the stage card's fill, under the ring */}
      <div ref={(el) => void (anchors.orderCard = el)} aria-hidden className="absolute rounded-3xl bg-mist" style={{ visibility: 'hidden' }} />
      {/* tap to pay: one giant place name per stop, sliding past behind the terminal */}
      <div ref={(el) => void (anchors.tapWords = el)} aria-hidden className="absolute inset-y-0 left-0 flex items-center" style={{ visibility: 'hidden' }}>
        {PLACES.map((pl) => (
          <span
            key={pl.word}
            className="w-screen select-none whitespace-nowrap text-center font-display font-bold leading-none text-mist"
            // sized per word so the longest still fits inside its screen with a margin
            // (Unbounded caps run ~0.9em wide each)
            style={{ fontSize: `min(22rem, ${(86 / (pl.word.length * 0.9)).toFixed(2)}vw)`, letterSpacing: '-0.05em' }}
          >
            {pl.word}
          </span>
        ))}
      </div>
      {/* ecosystem: each mode's tint (wiped in from the right) and its giant name, one screen
          each, sliding past behind the ring */}
      <div ref={(el) => void (anchors.ecoBack = el)} aria-hidden className="absolute inset-x-0 top-0 h-full" style={{ visibility: 'hidden' }}>
        {modes.map((m) => (
          <div key={m.id} className="absolute inset-0" style={{ background: wash(m, 0.1) }} />
        ))}
        <div className="absolute inset-y-0 left-0 flex items-center">
          {modes.map((m) => (
            <span
              key={m.id}
              className="w-screen select-none text-center font-display font-bold leading-none"
              style={{ fontSize: `min(30rem, ${(80 / (m.name.length * 0.9)).toFixed(1)}vw)`, letterSpacing: '-0.05em', color: wash(m, 0.16) }}
            >
              {m.name.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      <Canvas style={{ position: 'absolute', inset: 0 }} dpr={[1, 2]} camera={{ position: [0, 0, 7], fov: 32 }} gl={{ antialias: true }}>
        <Backdrop />
        <CameraRig />
        <Suspense fallback={null}>
          <Studio />
          <RingRig />
          <HeroShadow />
          <Terminal />
          <Coins />
          <RingFx />
          <SecuritySpots />
          <Envelope />
          <SpecCallouts />
          <Water light bare flat />
          <CompareModels />
        </Suspense>
      </Canvas>
    </div>
  )
}

/**
 * Softbox reflections built in-scene, so no HDR file has to load from a CDN. The environment
 * stays dark so the black ceramic reads as black on a white page; big soft white boxes give
 * the gloss, with a violet kicker and a faint deep-violet fill for the brand.
 */
function Studio() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 4, 3]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={3} position={[-4, 0.5, 3]} scale={[1.2, 6, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[4, 0, 2]} scale={[1.2, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, -4, 2]} scale={[8, 1, 1]} />
        <Lightformer form="ring" color="#9730F6" intensity={2} position={[-3, -1, -4]} scale={3} />
        <Lightformer form="rect" color="#3B1270" intensity={0.8} position={[4, -3, -2]} scale={[5, 3, 1]} />
      </Environment>
    </>
  )
}
