import { describe, expect, it } from 'vitest'
import { formatMessageTime } from './format-time'

describe('formatMessageTime', () => {
  it('formats a valid ISO timestamp as local HH:MM', () => {
    const result = formatMessageTime('2026-07-12T15:30:00.000Z')
    expect(result).toMatch(/^\d{1,2}:\d{2}/)
  })

  it('returns the original string when the date is invalid', () => {
    expect(formatMessageTime('not-a-date')).toBe('not-a-date')
  })
})
