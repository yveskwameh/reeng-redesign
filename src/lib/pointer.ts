/**
 * Pointer position over the viewport, -1…1 (y up), for the 3D scene to read in useFrame.
 * The canvas ignores pointer events (it sits behind the page), so R3F's own pointer never moves.
 */
export const pointer = { x: 0, y: 0 }

window.addEventListener(
  'pointermove',
  (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
  },
  { passive: true },
)
