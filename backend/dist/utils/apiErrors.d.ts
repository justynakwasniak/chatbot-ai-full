export declare const USER_ERRORS: {
    readonly UNAUTHORIZED: "Please sign in to continue.";
    readonly SESSION_EXPIRED: "Your session expired. Please sign in again.";
    readonly SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please try again later.";
    readonly AI_UNAVAILABLE: "AI tutor is temporarily unavailable. Please try again later.";
    readonly CONVERSATION_NOT_FOUND: "Conversation not found.";
    readonly MESSAGE_REQUIRED: "Message is required.";
    readonly FAILED_LOAD_CONVERSATIONS: "Failed to load conversations.";
    readonly FAILED_CREATE_CONVERSATION: "Failed to create a new chat.";
    readonly FAILED_LOAD_CONVERSATION: "Failed to load conversation.";
    readonly FAILED_SEND_MESSAGE: "Failed to send message. Please try again.";
    readonly GROQ_RATE_LIMIT: "Too many requests. Please wait a moment and try again.";
    readonly DAILY_LIMIT: (limit: number) => string;
};
export declare function logServerError(context: string, error: unknown): void;
export declare function getUserError(error: unknown, fallback: string): string;
export declare function isProduction(): boolean;
//# sourceMappingURL=apiErrors.d.ts.map