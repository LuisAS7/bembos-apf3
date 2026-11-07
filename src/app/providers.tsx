import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { PropsWithChildren } from 'react'
import { AppContext } from '../state/AppContext.ts'
import { appReducer, createInitialState } from '../state/appState.ts'
import type { AppAction } from '../state/appState.ts'
import { getLocation } from '../data/locations.ts'
import { readLastConfirmation, readOrder, readPreferences, saveLastConfirmation, saveOrder, savePreferences } from '../storage/browserStorage.ts'

function initialize() {
  const state = createInitialState()
  const preferences = readPreferences()
  const confirmation = readLastConfirmation()
  const order = readOrder()
  if (preferences.status === 'ok') state.preferences = preferences.value
  if (confirmation.status === 'ok') state.lastConfirmation = confirmation.value
  // Restore only the selected location. Cart hydration stays in phase 4.
  if (order.status === 'ok' && getLocation(order.value.locationId)) state.order.locationId = order.value.locationId
  if ([preferences.status, confirmation.status, order.status].includes('unavailable')) {
    state.storageNotice = 'El almacenamiento del navegador no está disponible. Los cambios se conservarán solo mientras esta página esté abierta.'
  } else if ([preferences.status, confirmation.status, order.status].includes('invalid')) {
    state.storageNotice = 'No pudimos recuperar algunos datos guardados. Puedes seguir navegando.'
  }
  // Order hydration/revalidation and its announcement will be connected in phase 4.
  return state
}

export function AppProviders({ children }: PropsWithChildren) {
  const [state, reduce] = useReducer(appReducer, undefined, initialize)
  const dispatch = useCallback((action: AppAction) => {
    let saved = true
    if (action.type === 'order/replace') saved = saveOrder(action.value).ok
    if (action.type === 'preferences/replace') saved = savePreferences(action.value).ok
    if (action.type === 'confirmation/replace') saved = saveLastConfirmation(action.value).ok
    reduce(action)
    if (!saved) reduce({ type: 'storage/notice', value: 'No pudimos guardar los cambios en este navegador. Permanecerán disponibles mientras esta página esté abierta.' })
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
