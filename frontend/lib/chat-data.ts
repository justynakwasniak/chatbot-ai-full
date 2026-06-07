export type Role = "user" | "assistant"

export interface Message {
  id: string
  role: Role
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  title: string
  preview: string
  updatedAt: string
  messages: Message[]
}

export const conversations: Conversation[] = [
  {
    id: "1",
    title: "Powitania i podstawy",
    preview: "¡Hola! — to najprostsze powitanie...",
    updatedAt: "Teraz",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Jak powiedzieć „cześć” po hiszpańsku?",
        timestamp: "13:42",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "¡Hola! — to najprostsze i najczęstsze powitanie.\n\nRano możesz powiedzieć „Buenos días”, wieczorem „Buenas noches”. Na pożegnanie: „Adiós” lub „Hasta luego”.\n\nSpróbuj teraz: jak powiedziałbyś „Dzień dobry, jak się masz?”",
        timestamp: "13:42",
      },
      {
        id: "m3",
        role: "user",
        content: "Buenos días, ¿cómo estás?",
        timestamp: "13:43",
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "Świetnie! ✔ „Buenos días, ¿cómo estás?” jest poprawne.\n\nPamiętaj o znaku ¿ na początku pytania. Odpowiedź: „Estoy bien, gracias”.\n\nĆwiczenie: napisz jak odpowiedziałbyś „Dobrze, dziękuję, a Ty?”",
        timestamp: "13:43",
      },
    ],
  },
  {
    id: "2",
    title: "Czas przeszły — pretérito",
    preview: "Mała poprawka: „Fui a la tienda ayer” ✔",
    updatedAt: "2 godz temu",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Yo fui a la tienda ayer",
        timestamp: "11:10",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Mała poprawka: „Fui a la tienda ayer” ✔\n\n„Yo” jest zbędne — w hiszpańskim często pomija się podmiot. „ir a” wymaga przyimka „a”.\n\nSpróbuj teraz użyć innego czasownika: np. „Wczoraj poszedłem do kina”.",
        timestamp: "11:11",
      },
    ],
  },
  {
    id: "3",
    title: "Słownictwo — jedzenie",
    preview: "„La manzana” to jabłko, „el pan” to chleb...",
    updatedAt: "Wczoraj",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Jak powiedzieć jabłko, chleb i woda po hiszpańsku?",
        timestamp: "18:30",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "„La manzana” — jabłko\n„El pan” — chleb\n„El agua” — woda (uwaga: rodzaj żeński, ale „el” zamiast „la”!)\n\nZapamiętaj: większość słów kończących się na -a to rodzaj żeński.\n\nĆwiczenie: przetłumacz „Chcę wodę i chleb”.",
        timestamp: "18:31",
      },
    ],
  },
]
