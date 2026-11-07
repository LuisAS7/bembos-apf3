import { useEffect, useState } from 'react'

// Mount the empty region before adding text, including restored-order messages.
export function LiveAnnouncement({ message, sequence = 0 }: { message: string; sequence?: number }) {
  const [announcement, setAnnouncement] = useState('')
  useEffect(() => {
    let contentTimer: number | undefined
    const timer = window.setTimeout(() => {
      setAnnouncement('')
      contentTimer = window.setTimeout(() => setAnnouncement(message), 100)
    }, 0)
    return () => { window.clearTimeout(timer); window.clearTimeout(contentTimer) }
  }, [message, sequence])
  return <div className="sr-only" role="status" aria-atomic="true">{announcement}</div>
}
