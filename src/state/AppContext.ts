import { createContext } from 'react'
import type { Dispatch } from 'react'
import type { AppAction, AppState } from './appState.ts'
import type { ConfirmationResult } from '../features/confirmation/confirmation.ts'

export const AppContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction>; confirmOrder: (attemptId: string) => ConfirmationResult } | null>(null)
