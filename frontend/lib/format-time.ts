/** Format an ISO timestamp in the user's local timezone. */
export function formatMessageTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}
