import { useLayoutEffect, useRef } from 'react'

// Reserve the actual fixed action bar, including wrapped text and the safe area.
// Notifications never contribute to this measurement.
export function useMobileActionBar(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const bar = ref.current
    if (!active || !bar) return
    const root = document.documentElement
    const media = window.matchMedia('(max-width: 47.99rem)')
    function measure() {
      if (bar && getComputedStyle(bar).position === 'fixed') root.style.setProperty('--page-action-space', `${Math.ceil(bar.getBoundingClientRect().height)}px`)
      else root.style.removeProperty('--page-action-space')
    }
    measure()
    media.addEventListener('change', measure)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    observer?.observe(bar)
    return () => { observer?.disconnect(); media.removeEventListener('change', measure); root.style.removeProperty('--page-action-space') }
  }, [active])
  return ref
}
