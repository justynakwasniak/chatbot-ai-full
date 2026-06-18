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
    title: "Greetings & basics",
    preview: "¡Hola! — the simplest greeting...",
    updatedAt: "Now",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "How do you say 'hello' in Spanish?",
        timestamp: "13:42",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "¡Hola! — the simplest and most common greeting.\n\nIn the morning you can say \"Buenos días\", in the evening \"Buenas noches\". To say goodbye: \"Adiós\" or \"Hasta luego\".\n\nTry now: how would you say \"Good morning, how are you?\"",
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
          "Great! ✔ \"Buenos días, ¿cómo estás?\" is correct.\n\nRemember the ¿ at the start of a question. A typical reply: \"Estoy bien, gracias\".\n\nExercise: write how you'd answer \"Fine, thanks, and you?\"",
        timestamp: "13:43",
      },
    ],
  },
  {
    id: "2",
    title: "Past tense — pretérito",
    preview: "Small fix: \"Fui a la tienda ayer\" ✔",
    updatedAt: "2h ago",
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
          "Small fix: \"Fui a la tienda ayer\" ✔\n\n\"Yo\" is optional — in Spanish the subject is often omitted. \"ir a\" requires the preposition \"a\".\n\nTry using another verb now, e.g. \"Yesterday I went to the cinema\".",
        timestamp: "11:11",
      },
    ],
  },
  {
    id: "3",
    title: "Vocabulary — food",
    preview: "\"La manzana\" is apple, \"el pan\" is bread...",
    updatedAt: "Yesterday",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "How do you say apple, bread and water in Spanish?",
        timestamp: "18:30",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "\"La manzana\" — apple\n\"El pan\" — bread\n\"El agua\" — water (note: feminine noun, but \"el\" instead of \"la\"!)\n\nRemember: most words ending in -a are feminine.\n\nExercise: translate \"I want water and bread\".",
        timestamp: "18:31",
      },
    ],
  },
]
