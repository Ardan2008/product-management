import Lenis from 'lenis'

let lenis: Lenis | null = null
let rafId = 0

export function startLenis() {
  if (lenis) return lenis

  lenis = new Lenis({
    duration: 1.5,
    easing: (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
    smoothWheel: true
  })

  const raf = (time: number) => {
    lenis?.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)

  return lenis
}

export function stopLenis() {
  cancelAnimationFrame(rafId)
  lenis?.destroy()
  lenis = null
}

export function getLenis() {
  return lenis
}