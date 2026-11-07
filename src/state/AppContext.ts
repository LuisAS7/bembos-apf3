import { createContext } from 'react'
import type { Dispatch } from 'react'
import type { AppAction, AppState } from './appState.ts'

export const AppContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction> } | null>(null)
