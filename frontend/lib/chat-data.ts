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
    title: "Pomysły na nazwę startupu",
    preview: "Świetnie, oto kilka propozycji nazw...",
    updatedAt: "Teraz",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Cześć! Pomóż mi wymyślić nazwę dla startupu zajmującego się AI w finansach.",
        timestamp: "13:42",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Jasne! Oto kilka propozycji, które łączą tematykę finansów z nowoczesnością AI:\n\n• FinPulse — sugeruje puls rynku w czasie rzeczywistym\n• Lumora — od „lumen\" (światło) i klarowności danych\n• Vantai — gra słów „vantage\" (przewaga) + AI\n\nKtóry kierunek najbardziej Ci odpowiada — bardziej techniczny czy przyjazny użytkownikowi?",
        timestamp: "13:42",
      },
      {
        id: "m3",
        role: "user",
        content: "Podoba mi się Lumora. Możesz rozwinąć ten kierunek?",
        timestamp: "13:43",
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "Świetny wybór! „Lumora\" brzmi nowocześnie i budzi skojarzenia z przejrzystością oraz inteligentnymi wglądami w dane. Pasują do tego hasła takie jak „Zobacz swoje finanse w nowym świetle\" albo „Klarowność, którą napędza AI\".",
        timestamp: "13:43",
      },
    ],
  },
  {
    id: "2",
    title: "Plan treningowy na tydzień",
    preview: "Oto zbalansowany plan na 5 dni...",
    updatedAt: "2 godz temu",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Ułóż mi plan treningowy na siłownię na tydzień.",
        timestamp: "11:10",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Oczywiście! Oto zbalansowany plan na 5 dni:\n\n• Pon — Klatka i triceps\n• Wt — Plecy i biceps\n• Śr — Nogi\n• Czw — Odpoczynek / cardio\n• Pt — Barki i brzuch\n\nChcesz, żebym dodał konkretne ćwiczenia i liczbę serii?",
        timestamp: "11:11",
      },
    ],
  },
  {
    id: "3",
    title: "Wyjaśnienie React Server Components",
    preview: "RSC pozwalają renderować komponenty...",
    updatedAt: "Wczoraj",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Wytłumacz mi prosto czym są React Server Components.",
        timestamp: "18:30",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "React Server Components (RSC) to komponenty renderowane na serwerze, które nie wysyłają swojego kodu JS do przeglądarki. Dzięki temu aplikacja jest lżejsza i szybsza, a Ty możesz bezpiecznie sięgać po dane bezpośrednio na serwerze.",
        timestamp: "18:31",
      },
    ],
  },
  {
    id: "4",
    title: "Przepis na szybki obiad",
    preview: "Makaron z czosnkiem i oliwą...",
    updatedAt: "Wczoraj",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Mam 15 minut, co mogę szybko ugotować?",
        timestamp: "20:05",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Polecam aglio e olio — makaron z czosnkiem i oliwą. Wystarczy ugotować spaghetti, podsmażyć czosnek na oliwie z chili, wymieszać i posypać natką. Gotowe w 15 minut!",
        timestamp: "20:06",
      },
    ],
  },
  {
    id: "5",
    title: "Pomoc z CV",
    preview: "Świetnie, dopracujmy sekcję o doświadczeniu...",
    updatedAt: "3 dni temu",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Pomożesz mi poprawić CV pod stanowisko frontend developera?",
        timestamp: "09:15",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Z przyjemnością! Zacznijmy od sekcji o doświadczeniu — warto opisywać osiągnięcia liczbami, np. „Zwiększyłem wydajność strony o 40%\". Wklej swoją obecną treść, a zaproponuję konkretne poprawki.",
        timestamp: "09:16",
      },
    ],
  },
]
