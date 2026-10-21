import type { Directive } from 'vue'

let observer: IntersectionObserver | null = null

const getObserver = (): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-revealed')
          observer?.unobserve(entry.target) // efek hanya diputar sekali
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
  }

  return observer
}

export const reveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('reveal')

    const delay = Number(binding.value ?? 0)
    if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`)

    const io = getObserver()
    if (!io) {
      el.classList.add('is-revealed')
      return
    }

    io.observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  }
}