import { lazy, Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { ScrollBar } from './components/ScrollBar'
import { scrollToY, useSmoothScroll } from './lib/useSmoothScroll'

// three.js + R3F are the bulk of the bundle; load them after the page shell
const Scene = lazy(() => import('./scene/Scene').then((m) => ({ default: m.Scene })))

export default function App() {
  useSmoothScroll()
  const { pathname, hash } = useLocation()

  // route changes: jump to the #section if there is one, otherwise start at the top
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    // wait a tick so the page (and its section heights) has rendered
    const id = setTimeout(() => {
      const el = document.getElementById(hash.slice(1))
      if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY, true)
    }, 50)
    return () => clearTimeout(id)
  }, [pathname, hash])

  return (
    <>
      <Nav />
      {/* the 3D ring lives on the home page; other routes stay lightweight */}
      {pathname === '/' && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}
      <Outlet />
      <Footer />
      <ScrollBar />
    </>
  )
}
