import type { ChangeEvent } from 'react'

interface FormFieldProps {
  id: string
  label: string
  help?: string
  placeholder?: string
  onBlur?: () => void
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  type?: 'text' | 'tel' | 'password'
  inputMode?: 'text' | 'tel' | 'numeric' | 'decimal'
  autoComplete: string
  maxLength: number
  multiline?: boolean
}

export function FormField({ id, label, help, placeholder, onBlur, value, onChange, error, required = true, type = 'text', inputMode, autoComplete, maxLength, multiline }: FormFieldProps) {
  const description = [help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
  const control = { id, name: id, value, required, autoComplete, maxLength, placeholder, onBlur,
    'aria-required': required, 'aria-invalid': Boolean(error), 'aria-describedby': description,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) }
  return <div className="form-field">
    <label htmlFor={id}>{label} <span>({required ? 'obligatorio' : 'opcional'})</span></label>
    {multiline ? <textarea {...control} rows={3} /> : <input {...control} type={type} inputMode={inputMode ?? (type === 'tel' ? 'tel' : 'text')} />}
    {help && <p id={`${id}-help`} className="control-help">{help}</p>}
    {error && <p id={`${id}-error`} className="field-error">{error}</p>}
  </div>
}
