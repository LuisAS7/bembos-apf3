import { useEffect, useRef, useState } from 'react'
import { Toaster as SonnerToaster, toast } from 'sonner'
import { useAppState } from '../../hooks/useAppState.ts'
import { notificationDuration, notificationEntries, notificationPlan } from './notificationPlan.ts'
import { ToastNotice } from './ToastNotice.tsx'
import './Toaster.css'

export function Toaster() {
  const { state, dispatch } = useAppState()
  const { toasts, storageNotice, recoveryNotice } = state
  const known = useRef(new Map<string, string>())
  const [position, setPosition] = useState<'top-right' | 'top-center'>('top-right')
  useEffect(() => {
    const entries = notificationEntries({ toasts, storageNotice, recoveryNotice })
    const plan = notificationPlan(known.current, entries)
    known.current.clear()
    plan.next.forEach((value, id) => known.current.set(id, value))
    function dismiss(id: string, moveFocus: boolean) {
      if (moveFocus) {
        const buttons = [...document.querySelectorAll<HTMLElement>('[data-toast-dismiss]')]
        const index = buttons.findIndex((button) => button.id === `dismiss-${id}`)
        const next = buttons[index + 1] ?? buttons[index - 1]
        requestAnimationFrame(() => (next?.isConnected ? next : document.getElementById('contenido-principal'))?.focus({ preventScroll: true }))
      }
      toast.dismiss(id)
      if (!id.startsWith('app-')) dispatch({ type: 'toast/dismiss', toastId: id })
    }
    plan.remove.forEach((id) => toast.dismiss(id))
    plan.upsert.forEach((notice) => toast.custom(() => <ToastNotice notice={notice} onDismiss={() => dismiss(notice.id, true)} onUndo={() => {
      dispatch({ type: 'cart/undo', toastId: notice.id })
      requestAnimationFrame(() => document.getElementById(`dismiss-${notice.id}`)?.focus({ preventScroll: true }))
    }} />, { id: notice.id, duration: notificationDuration(notice), dismissible: false,
      onAutoClose: () => dismiss(notice.id, Boolean(document.getElementById(`dismiss-${notice.id}`)?.closest('[data-sonner-toast]')?.contains(document.activeElement))) }))
  }, [toasts, storageNotice, recoveryNotice, dispatch])
  useEffect(() => {
    const header = document.querySelector('header')
    const media = window.matchMedia('(max-width: 47.99rem)')
    const place = () => {
      setPosition(media.matches ? 'top-center' : 'top-right')
      document.documentElement.style.setProperty('--header-height', `${header?.getBoundingClientRect().height ?? 96}px`)
    }
    place()
    media.addEventListener('change', place)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null
    if (header) observer?.observe(header)
    return () => { media.removeEventListener('change', place); observer?.disconnect(); document.documentElement.style.removeProperty('--header-height') }
  }, [])
  useEffect(() => {
    const active = known.current
    return () => { active.forEach((_, id) => toast.dismiss(id)); active.clear() }
  }, [])
  return <SonnerToaster className="notification-toaster"
    theme="light" position={position} expand visibleToasts={Math.max(state.toasts.length + 2, 3)}
      offset={{ top: 'calc(var(--header-height, 96px) + .5rem)', right: '1rem', left: '1rem' }}
      mobileOffset={{ top: 'calc(var(--header-height, 96px) + .5rem)', right: '1rem', left: '1rem' }}
      customAriaLabel="Avisos del pedido. Alt+T para ir a los avisos." hotkey={['altKey', 'KeyT']} />
}
