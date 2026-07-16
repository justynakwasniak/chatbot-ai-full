import { describe, expect, it } from 'vitest'
import { prepareTextForSpeech } from './speech'

describe('prepareTextForSpeech', () => {
  it('strips markdown bold markers', () => {
    expect(prepareTextForSpeech('Hola **amigo**')).toBe('Hola amigo')
  })

  it('strips bullet prefixes and collapses whitespace', () => {
    expect(prepareTextForSpeech('* uno\n- dos\n• tres')).toBe('uno dos tres')
  })

  it('removes common emoji used in tutor replies', () => {
    expect(prepareTextForSpeech('Bien ✅ 🇪🇸 💡')).toBe('Bien')
  })

  it('trims the result', () => {
    expect(prepareTextForSpeech('  hola  ')).toBe('hola')
  })
})
