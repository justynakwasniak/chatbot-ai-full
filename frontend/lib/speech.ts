/** Strip markdown and emoji so TTS reads natural Spanish. */
export function prepareTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^[*•-]\s+/gm, '')
    .replace(/[✅💡🇪🇸🙂😊🙅‍♂️🍵🌞]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSpanishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'es-ES') ??
    voices.find((v) => v.lang.startsWith('es-')) ??
    null
  )
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakSpanish(text: string): void {
  if (!isSpeechSupported()) return

  const run = () => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(prepareTextForSpeech(text))
    utterance.lang = 'es-ES'
    utterance.rate = 0.92

    const voice = getSpanishVoice()
    if (voice) utterance.voice = voice

    window.speechSynthesis.speak(utterance)
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    run()
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', run, { once: true })
  }
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel()
}
