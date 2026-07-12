interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

type RecognitionCtor = new () => SpeechRecognition

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const win = window as Window & {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null
}

let activeRecognition: SpeechRecognition | null = null

export type DictationLang = 'en-US' | 'es-ES'

export const DICTATION_LANGS: { id: DictationLang; label: string }[] = [
  { id: 'en-US', label: 'EN' },
  { id: 'es-ES', label: 'ES' },
]

export function isRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null
}

export function stopSpeechRecognition(): void {
  activeRecognition?.stop()
  activeRecognition = null
}

interface StartOptions {
  lang: DictationLang
  onTranscript: (text: string) => void
  onEnd: () => void
  onError?: (message: string) => void
}

export function startSpeechRecognition({ lang, onTranscript, onEnd, onError }: StartOptions): boolean {
  const Ctor = getRecognitionCtor()
  if (!Ctor) return false

  stopSpeechRecognition()

  const recognition = new Ctor()
  activeRecognition = recognition

  recognition.lang = lang
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let transcript = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript
    }
    onTranscript(transcript)
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error !== 'aborted') {
      onError?.(event.error)
    }
    activeRecognition = null
    onEnd()
  }

  recognition.onend = () => {
    activeRecognition = null
    onEnd()
  }

  recognition.start()
  return true
}
