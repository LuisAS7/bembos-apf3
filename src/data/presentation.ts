// Presentation aliases only: persisted IDs, prices and historic snapshots stay intact.
export function displayName(name: string): string {
  return name.replace(/\s+Demo\b/g, '').replace(/\s+Local\s+/g, ' ')
}
