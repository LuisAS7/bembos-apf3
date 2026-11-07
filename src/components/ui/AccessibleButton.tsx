import type { ComponentPropsWithoutRef } from 'react'

export function AccessibleButton({ type = 'button', className = '', ...props }: ComponentPropsWithoutRef<'button'>) {
  return <button type={type} className={`button ${className}`.trim()} {...props} />
}
