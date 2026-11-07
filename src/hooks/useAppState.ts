import { useContext } from 'react'
import { AppContext } from '../state/AppContext.ts'

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState requires AppProviders')
  return context
}
