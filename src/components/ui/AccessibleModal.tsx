import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import './AccessibleModal.css'

interface AccessibleModalProps { id?: string; open: boolean; title: string; children: ReactNode; onClose: () => void }

export function AccessibleModal({ id, open, title, children, onClose }: AccessibleModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open || !dialogRef.current) return
    const dialog = dialogRef.current
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    // showModal supplies the native top layer and makes the background inert.
    dialog.showModal()
    titleRef.current?.focus()
    return () => {
      if (dialog.open) dialog.close()
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open])

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return
    const dialog = dialogRef.current
    if (!dialog) return
    const controls = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.closest('[hidden], [inert]') && element.getClientRects().length > 0)
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (!first) { event.preventDefault(); titleRef.current?.focus(); return }
    const active = document.activeElement
    if (event.shiftKey && (active === first || !controls.includes(active as HTMLElement))) {
      event.preventDefault(); last.focus()
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault(); first.focus()
    }
  }

  return <dialog id={id} ref={dialogRef} className="accessible-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose() }} onKeyDown={containFocus}>
    <h2 id={titleId} ref={titleRef} tabIndex={-1}>{title}</h2>
    {children}
  </dialog>
}
