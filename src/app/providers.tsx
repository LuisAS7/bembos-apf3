import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import { AppContext } from '../state/AppContext.ts'
import { appReducer, createInitialState } from '../state/appState.ts'
import type { AppAction } from '../state/appState.ts'
import { recoverOrder } from '../features/cart/cart.ts'
import { clearStoredOrder, readLastConfirmation, readOrder, readPreferences, saveLastConfirmation, saveOrder, savePreferences } from '../storage/browserStorage.ts'

function initialize() {
  const state = createInitialState()
  const preferences = readPreferences()
  const confirmation = readLastConfirmation()
  const order = readOrder()
  if (preferences.status === 'ok') state.preferences = preferences.value
  if (confirmation.status === 'ok') state.lastConfirmation = confirmation.value
  const recovered = recoverOrder(order, state.order)
  state.order = recovered.order
  state.recoveryNotice = recovered.message
  if ([preferences.status, confirmation.status, order.status].includes('unavailable')) {
    state.storageNotice = 'El almacenamiento del navegador no está disponible. Los cambios se conservarán solo mientras esta página esté abierta.'
  } else if ([preferences.status, confirmation.status, order.status].includes('invalid')) {
    state.storageNotice = 'No pudimos recuperar algunos datos guardados. Puedes seguir navegando.'
  }
  return state
}

export function AppProviders({ children }: PropsWithChildren) {
  const [state, reduce] = useReducer(appReducer, undefined, initialize)
  // Event dispatches share the latest reduced state, including batched actions.
  // Initialization remains read-only: a damaged snapshot is never overwritten on mount.
  const currentState = useRef(state)
  const dispatch = useCallback((action: AppAction) => {
    const previous = currentState.current
    const next = appReducer(previous, action)
    currentState.current = next
    let saved = true
    if (action.type === 'cart/clear') saved = clearStoredOrder().ok
    else if (next.order !== previous.order) saved = saveOrder(next.order).ok
    if (action.type === 'preferences/replace') saved = savePreferences(action.value).ok
    if (action.type === 'confirmation/replace') saved = saveLastConfirmation(action.value).ok
    reduce(action)
    if (!saved) {
      const notice: AppAction = { type: 'storage/notice', value: action.type === 'cart/clear'
        ? 'Limpiamos el pedido en esta página, pero no pudimos borrar la copia guardada. Puede reaparecer al recargar. Revisa los permisos de almacenamiento.'
        : 'No pudimos guardar los cambios en este navegador. Permanecerán disponibles mientras esta página esté abierta.' }
      currentState.current = appReducer(next, notice)
      reduce(notice)
    }
  }, [])
  useEffect(() => {
    const root = document.documentElement
    root.dataset.textSize = state.preferences.textSize
    root.dataset.reduceMotion = String(state.preferences.reduceMotion)
    root.dataset.underlineLinks = String(state.preferences.underlineLinks)
  }, [state.preferences])
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
