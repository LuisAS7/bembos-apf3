// Format only a complete compact value, on blur/submit. Partial edits stay untouched.
export function formatExpiry(value: string): string {
  return /^\d{4}$/.test(value) ? `${value.slice(0, 2)}/${value.slice(2)}` : value
}
