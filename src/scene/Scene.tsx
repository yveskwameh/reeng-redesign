import { Environment, Lightformer } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Backdrop } from './Backdrop'
import { CompareModels } from './CompareModels'
import { Coins } from './Coins'
import { EcoCard } from './EcoCard'
import { Envelope } from './Envelope'
import { SpecCallouts } from './SpecCallouts'
import { Water } from './Water'
import { Hotspots } from './Hotspots'
import { Phone } from './Phone'
import { RingRig } from './RingRig'
import { anchors } from './scrollState'
import { RingFx } from './RingFx'
import { Terminal } from './Terminal'

/**
 * One persistent canvas fixed behind the page. Sections drive the ring
 * through scroll (see scrollState.ts) rather than mounting their own canvases.
 */
export function Scene() {
  return (
    <div ref={(el) => void (anchors.backdrop = el)} className="pointer-events-none fixed inset-0 z-0">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 7], fov: 32 }} gl={{ antialias: true }}>
        <Backdrop />
        <Suspense fallback={null}>
          <Studio />
          <RingRig />
          <Terminal />
          <Coins />
          <Phone />
          <RingFx />
          <Hotspots />
          <Envelope />
          <SpecCallouts />
          <Water />
          <CompareModels />
          <EcoCard />
        </Suspense>
      </Canvas>
    </div>
  )
}

/** Softbox reflections built in-scene, so no HDR file has to load from a CDN. */
function Studio() {
  return (
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={3} position={[3, 3, 4]} scale={[4, 2, 1]} />
      <Lightformer form="rect" intensity={2.5} position={[-4, 0.5, 3]} scale={[1, 6, 1]} />
      <Lightformer form="rect" intensity={1.5} position={[0, 5, -2]} scale={[8, 1, 1]} />
      {/* brand purple rim, matching the Blender renders */}
      <Lightformer form="ring" color="#9730F6" intensity={2.4} position={[-3, -1, -4]} scale={3} />
      {/* faint deep-violet fill so the ring's dark side separates from the ink background */}
      <Lightformer form="rect" color="#3B1270" intensity={1.2} position={[4, -3, -2]} scale={[5, 3, 1]} />
    </Environment>
  )
}
