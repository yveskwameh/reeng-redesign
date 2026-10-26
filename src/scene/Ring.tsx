import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { useLayoutEffect, useMemo } from 'react'
import { Color, Mesh, MeshPhysicalMaterial, type Object3D } from 'three'
import { anchors } from './scrollState'

const MODEL = '/models/reeng_ring.glb'
const DRACO = '/draco/' // self-hosted decoder, copied from three/examples

type RingProps = Omit<ThreeElements['primitive'], 'object'> & {
  /** Shell colour; swaps the ceramic finish for the configurator. */
  finish?: string
  /** Register this ring's parts in `anchors.ringParts` (own materials, rest pose kept) for scene effects. */
  exposeParts?: boolean
}

/**
 * The Reeng ring built in 3d/build_ring.py.
 * Named parts — Shell, Liner, Antenna, SecureChip — can be animated
 * individually (e.g. the exploded security view).
 */
export function Ring({ finish, exposeParts, ...props }: RingProps) {
  const { scene } = useGLTF(MODEL, DRACO)
  // clone so several rings (compare table, configurator) can coexist
  const ring = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    ring.traverse((o: Object3D) => {
      if (!(o instanceof Mesh)) return
      o.castShadow = true
      if (o.name === 'Shell') {
        const mat = (o.material as MeshPhysicalMaterial).clone()
        if (finish) mat.color = new Color(finish)
        mat.envMapIntensity = 1.4
        o.material = mat
      }
      // own material per mesh so effects (glow) don't leak into other rings
      if (exposeParts && o.name !== 'Shell') o.material = (o.material as MeshPhysicalMaterial).clone()
    })
    if (exposeParts) {
      // parts are the root node's children; a multi-material part (Liner) is a group of meshes
      const root = ring.getObjectByName('ReengRing') ?? ring
      for (const part of root.children) anchors.ringParts[part.name] = part
    }
  }, [ring, finish, exposeParts])

  return <primitive object={ring} {...props} />
}

useGLTF.preload(MODEL, DRACO)
