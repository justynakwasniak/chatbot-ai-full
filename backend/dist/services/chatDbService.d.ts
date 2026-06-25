export interface DbConversation {
    id: string;
    user_id: string;
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
export declare function listConversations(userId: string): Promise<DbConversation[]>;
export declare function createConversation(userId: string, title?: string): Promise<DbConversation>;
export declare function getConversationMessages(conversationId: string, userId: string): Promise<DbMessage[]>;
export declare function ensureConversation(userId: string, conversationId?: string): Promise<string>;
export declare function addMessage(conversationId: string, userId: string, role: 'user' | 'assistant', content: string): Promise<DbMessage>;
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