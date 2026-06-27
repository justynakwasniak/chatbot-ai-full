export const USER_ERRORS = {
  UNAUTHORIZED: 'Please sign in to continue.',
  SESSION_EXPIRED: 'Your session expired. Please sign in again.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  AI_UNAVAILABLE: 'AI tutor is temporarily unavailable. Please try again later.',
  CONVERSATION_NOT_FOUND: 'Conversation not found.',
  MESSAGE_REQUIRED: 'Message is required.',
  FAILED_LOAD_CONVERSATIONS: 'Failed to load conversations.',
  FAILED_CREATE_CONVERSATION: 'Failed to create a new chat.',
  FAILED_LOAD_CONVERSATION: 'Failed to load conversation.',
  FAILED_SEND_MESSAGE: 'Failed to send message. Please try again.',
  GROQ_RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  DAILY_LIMIT: (limit: number) =>
    `Daily limit reached (${limit} messages per user). Try again tomorrow.`,
} as const;

export function logServerError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
}

export function getUserError(error: unknown, fallback: string): string {
  if (process.env.NODE_ENV !== 'production' && error instanceof Error && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message.includes('Conversation not found')) {
    return USER_ERRORS.CONVERSATION_NOT_FOUND;
  }

  return fallback;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
