/** Form controls use `YYYY-MM-DD`; table rows display `YYYY/MM/DD`. */
export function toDisplayDate(value: string): string {
  return value ? value.replace(/-/g, '/') : '';
}

export function toInputDate(value: string): string {
  return value ? value.replace(/\//g, '-') : '';
}
