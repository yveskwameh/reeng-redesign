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
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
