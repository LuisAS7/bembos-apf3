import { useState } from 'react'
import { Accessibility, Check } from 'lucide-react'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { AccessibleModal } from '../../components/ui/AccessibleModal.tsx'
import { useAppState } from '../../hooks/useAppState.ts'
import type { DisplayPreferences } from '../../domain/models.ts'
import './Accessibility.css'

const DEFAULT_PREFERENCES: DisplayPreferences = { textSize: 'default', reduceMotion: false, underlineLinks: false, colorVision: 'none' }

const TEXT_SIZE_OPTIONS: { value: DisplayPreferences['textSize']; label: string }[] = [
  { value: 'default', label: 'Normal' },
  { value: 'large', label: 'Grande' },
  { value: 'extra-large', label: 'Muy grande' },
]

// Swatch hexes mirror the html[data-color-vision] overrides in Accessibility.css; keep both in sync.
type VisionMode = NonNullable<DisplayPreferences['colorVision']>
const COLOR_VISION_OPTIONS: { value: VisionMode; label: string; hint: string; swatches: { error: string; success: string; action: string } }[] = [
  { value: 'none', label: 'Sin ajuste', hint: 'Usa los colores originales de la marca.', swatches: { error: '#b91c1c', success: '#1f7a3d', action: '#ffb500' } },
  { value: 'protanopia', label: 'Protanopía (rojo)', hint: 'Cambia el error a un rojo-naranja y el éxito a un azul oscuro para distinguirlos mejor.', swatches: { error: '#c2410c', success: '#0f4c5c', action: '#ffb500' } },
  { value: 'deuteranopia', label: 'Deuteranopía (verde)', hint: 'Cambia el error a un rojo-naranja y el éxito a un azul oscuro para distinguirlos mejor.', swatches: { error: '#c2410c', success: '#0f4c5c', action: '#ffb500' } },
  { value: 'tritanopia', label: 'Tritanopía (azul)', hint: 'Cambia el color de acción a un naranja coral, separado del azul de la marca.', swatches: { error: '#b3261e', success: '#15803d', action: '#ff7a45' } },
]

export function AccessibilityMenu() {
  const { state, dispatch } = useAppState()
  const [open, setOpen] = useState(false)
  const preferences = state.preferences
  const colorVision = preferences.colorVision ?? 'none'

  function apply(next: DisplayPreferences) { dispatch({ type: 'preferences/replace', value: next }) }
  function close() { setOpen(false) }

  return <>
    <button className="header-accessibility" type="button" aria-haspopup="dialog" aria-expanded={open} aria-label="Accesibilidad"
      onClick={() => setOpen(true)}>
      <Accessibility size={22} aria-hidden="true" /><span aria-hidden="true">Accesibilidad</span>
    </button>
    <AccessibleModal id="dialogo-accesibilidad" open={open} title="Accesibilidad" onClose={close}>
      <div className="accessibility-form">
        <fieldset className="accessibility-fieldset">
          <legend>Tamaño de texto</legend>
          {TEXT_SIZE_OPTIONS.map((option) => <label key={option.value}
            className={`accessibility-option${preferences.textSize === option.value ? ' accessibility-option--selected' : ''}`}>
            <input type="radio" name="textSize" value={option.value} checked={preferences.textSize === option.value}
              onChange={() => apply({ ...preferences, textSize: option.value })} />
            <div><strong>{option.label}</strong></div>
            {preferences.textSize === option.value && <Check size={20} aria-hidden="true" className="accessibility-check" />}
          </label>)}
        </fieldset>
        <fieldset className="accessibility-fieldset">
          <legend>Visión de color (daltonismo)</legend>
          <p className="accessibility-hint">Ajusta los colores de error, éxito y acción para que se distingan mejor.</p>
          {COLOR_VISION_OPTIONS.map((option) => <label key={option.value}
            className={`accessibility-option${colorVision === option.value ? ' accessibility-option--selected' : ''}`}>
            <input type="radio" name="colorVision" value={option.value} checked={colorVision === option.value}
              onChange={() => apply({ ...preferences, colorVision: option.value })} />
            <div>
              <strong>{option.label}</strong>
              <small>{option.hint}</small>
              <span className="accessibility-swatches" aria-hidden="true">
                <span className="accessibility-swatch" style={{ background: option.swatches.error }} />
                <span className="accessibility-swatch" style={{ background: option.swatches.success }} />
                <span className="accessibility-swatch" style={{ background: option.swatches.action }} />
              </span>
            </div>
            {colorVision === option.value && <Check size={20} aria-hidden="true" className="accessibility-check" />}
          </label>)}
        </fieldset>
        <fieldset className="accessibility-fieldset">
          <legend>Otros ajustes</legend>
          <label className="accessibility-switch">
            <span>Subrayar enlaces</span>
            <input type="checkbox" checked={preferences.underlineLinks} onChange={(event) => apply({ ...preferences, underlineLinks: event.target.checked })} />
            <span className="accessibility-switch-track" aria-hidden="true" />
          </label>
          <label className="accessibility-switch">
            <span>Reducir animaciones</span>
            <input type="checkbox" checked={preferences.reduceMotion} onChange={(event) => apply({ ...preferences, reduceMotion: event.target.checked })} />
            <span className="accessibility-switch-track" aria-hidden="true" />
          </label>
        </fieldset>
      </div>
      <div className="modal-actions">
        <AccessibleButton className="button--secondary" onClick={() => apply(DEFAULT_PREFERENCES)}>Restablecer</AccessibleButton>
        <AccessibleButton onClick={close}>Listo</AccessibleButton>
      </div>
    </AccessibleModal>
  </>
}
