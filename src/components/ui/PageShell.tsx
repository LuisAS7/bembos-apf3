import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface PageShellProps {
  title: string
  description: string
  heading: string
  message: string
  icon: ReactNode
  next: { to: string; label: string }
  aside?: ReactNode
}

export function PageShell({ title, description, heading, message, icon, next, aside }: PageShellProps) {
  return <>
    <div className="page-heading">
      <p className="eyebrow">Tu pedido, a tu manera</p>
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
    </div>
    <div className={aside ? 'content-layout content-layout--split' : 'content-layout'}>
      <section className="shell-panel" aria-labelledby="shell-heading">
        <span className="shell-icon" aria-hidden="true">{icon}</span>
        <h2 id="shell-heading">{heading}</h2>
        <p>{message}</p>
        <Link className="button" to={next.to}>{next.label}</Link>
      </section>
      {aside}
    </div>
  </>
}
