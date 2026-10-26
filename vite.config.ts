import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // pre-bundle up front: deps discovered mid-session get a second React copy ("Invalid hook call")
  optimizeDeps: {
    include: ['gsap', 'gsap/ScrollTrigger', '@gsap/react', 'lenis', 'three', '@react-three/fiber', '@react-three/drei'],
  },
})
