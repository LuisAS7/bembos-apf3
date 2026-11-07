import type { ChangeEvent } from 'react'

interface FormFieldProps {
  id: string
  label: string
  help: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  type?: 'text' | 'tel'
  autoComplete: string
  maxLength: number
  multiline?: boolean
}

export function FormField({ id, label, help, value, onChange, error, required = true, type = 'text', autoComplete, maxLength, multiline }: FormFieldProps) {
  const control = { id, name: id, value, required, autoComplete, maxLength,
    'aria-required': required, 'aria-invalid': Boolean(error), 'aria-describedby': `${id}-help${error ? ` ${id}-error` : ''}`,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) }
  return <div className="form-field">
    <label htmlFor={id}>{label} <span>({required ? 'obligatorio' : 'opcional'})</span></label>
    <p id={`${id}-help`} className="control-help">{help}</p>
    {multiline ? <textarea {...control} rows={3} /> : <input {...control} type={type} inputMode={type === 'tel' ? 'tel' : 'text'} />}
    {error && <p id={`${id}-error`} className="field-error">{error}</p>}
  </div>
}
