export type Role = "user" | "assistant"

export interface MessageAttachment {
  id: string
  name: string
  mimeType: string
  dataUrl?: string
  extractedText?: string
}

export interface Message {
  id: string
  role: Role
  content: string
  timestamp: string
  attachments?: MessageAttachment[]
}

export interface Conversation {
  id: string
  title: string
  preview: string
  updatedAt: string
  messages: Message[]
}
