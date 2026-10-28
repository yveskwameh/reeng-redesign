import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import App from './App.tsx'
import './index.css'
import { Home } from './pages/Home.tsx'
import { Checkout, NotFound, OrderSuccess, Privacy, Terms } from './pages/Simple.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'order/success', element: <OrderSuccess /> },
      { path: 'privacy-policy', element: <Privacy /> },
      { path: 'terms-of-service', element: <Terms /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  // design review pages (outside App: own nav, no main scene)
  {
    path: 'options/pay-by-email',
    lazy: async () => ({ Component: (await import('./section-options/email/EmailOptions.tsx')).EmailOptions }),
  },
  {
    path: 'options/security',
    lazy: async () => ({ Component: (await import('./section-options/security/SecurityOptions.tsx')).SecurityOptions }),
  },
  {
    path: 'options/how-it-works',
    lazy: async () => ({ Component: (await import('./section-options/how/HowOptions.tsx')).HowOptions }),
  },
  {
    path: 'options/tap-to-pay',
    lazy: async () => ({ Component: (await import('./section-options/tap-to-pay/TapOptions.tsx')).TapOptions }),
  },
  {
    path: 'options/cross-chain',
    lazy: async () => ({ Component: (await import('./section-options/cross-chain/CrossChainOptions.tsx')).CrossChainOptions }),
  },
  { path: 'hero-options', lazy: async () => ({ Component: (await import('./hero-options/HeroOptions.tsx')).HeroOptions }) },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
