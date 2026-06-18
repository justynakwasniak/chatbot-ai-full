export interface DbConversation {
    id: string;
    session_id: string;
    title: string;
    preview: string;
    created_at: string;
    updated_at: string;
}
export interface DbMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}
export declare function listConversations(sessionId: string): Promise<DbConversation[]>;
export declare function createConversation(sessionId: string, title?: string): Promise<DbConversation>;
export declare function getConversationMessages(conversationId: string, sessionId: string): Promise<DbMessage[]>;
export declare function addMessage(conversationId: string, sessionId: string, role: 'user' | 'assistant', content: string): Promise<DbMessage>;
export declare function mapConversationForApi(conversation: DbConversation, messages?: DbMessage[]): {
    id: string;
    title: string;
    preview: string;
    updatedAt: string;
    messages: {
        id: string;
        role: "user" | "assistant";
        content: string;
        timestamp: string;
    }[];
};
//# sourceMappingURL=chatDbService.d.ts.map