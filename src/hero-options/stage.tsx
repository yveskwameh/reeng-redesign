import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, type ReactNode } from 'react'

/** Same camera as the main scene, transparent so the page colour shows through. */
export function Stage({ children, shadow, cameraZ = 7 }: { children: ReactNode; shadow?: { y: number; opacity?: number }; cameraZ?: number }) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0 }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, cameraZ], fov: 32 }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <LightStudio />
        {children}
        {shadow && (
          <ContactShadows position={[0, shadow.y, 0]} opacity={shadow.opacity ?? 0.4} scale={5} blur={2.4} far={2.5} resolution={512} />
        )}
      </Suspense>
    </Canvas>
  )
}

/**
 * Studio for a light page: the environment stays dark so the black ceramic reads as black,
 * with big soft white boxes for the gloss and a small violet kicker for the brand.
 */
function LightStudio() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 4, 3]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={3} position={[-4, 0.5, 3]} scale={[1.2, 6, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[4, 0, 2]} scale={[1.2, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, -4, 2]} scale={[8, 1, 1]} />
        <Lightformer form="ring" color="#9730F6" intensity={2} position={[-3, -1, -4]} scale={3} />
      </Environment>
    </>
  )
}

export const Logo = ({ className = 'h-7' }: { className?: string }) => (
  <a href="/hero-options" aria-label="Reeng home">
    <img src="/images/reeng_header_logo.svg" alt="Reeng" className={className} />
  </a>
)
