"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const chatDbService_1 = require("../services/chatDbService");
const groqService_1 = require("../services/groqService");
const router = (0, express_1.Router)();
router.get('/conversations', async (req, res) => {
    try {
        const sessionId = String(req.query.session_id || '');
        if (!sessionId) {
            return res.status(400).json({ success: false, error: 'session_id is required' });
        }
        if (!(0, supabase_1.isSupabaseConfigured)()) {
            return res.json({ success: true, data: [], dbEnabled: false });
        }
        const conversations = await (0, chatDbService_1.listConversations)(sessionId);
        const data = conversations.map((conversation) => (0, chatDbService_1.mapConversationForApi)(conversation));
        res.json({ success: true, data, dbEnabled: true });
    }
    catch (error) {
        console.error('List conversations error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
    }
});
router.post('/conversations', async (req, res) => {
    try {
        const { session_id: sessionId, title } = req.body;
        if (!sessionId) {
            return res.status(400).json({ success: false, error: 'session_id is required' });
        }
        if (!(0, supabase_1.isSupabaseConfigured)()) {
            return res.status(503).json({ success: false, error: 'Database not configured' });
        }
        const conversation = await (0, chatDbService_1.createConversation)(sessionId, title);
        res.status(201).json({
            success: true,
            data: (0, chatDbService_1.mapConversationForApi)(conversation),
        });
    }
    catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ success: false, error: 'Failed to create conversation' });
    }
});
router.get('/conversations/:id', async (req, res) => {
    try {
        const sessionId = String(req.query.session_id || '');
        const { id } = req.params;
        if (!sessionId) {
            return res.status(400).json({ success: false, error: 'session_id is required' });
        }
        if (!(0, supabase_1.isSupabaseConfigured)()) {
            return res.status(503).json({ success: false, error: 'Database not configured' });
        }
        const conversations = await (0, chatDbService_1.listConversations)(sessionId);
        const conversation = conversations.find((item) => item.id === id);
        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        const messages = await (0, chatDbService_1.getConversationMessages)(id, sessionId);
        res.json({
            success: true,
            data: (0, chatDbService_1.mapConversationForApi)(conversation, messages),
        });
    }
    catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
    }
});
router.post('/message', async (req, res) => {
    try {
        const { message, conversation_id: conversationId, session_id: sessionId } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Groq API key not configured. Add GROQ_API_KEY to backend/.env',
            });
        }
        if ((0, supabase_1.isSupabaseConfigured)()) {
            if (!conversationId || !sessionId) {
                return res.status(400).json({
                    success: false,
                    error: 'conversation_id and session_id are required when database is enabled',
                });
            }
            await (0, chatDbService_1.addMessage)(conversationId, sessionId, 'user', message);
        }
        const teacherResponse = await (0, groqService_1.getTeacherResponse)(message);
        let savedMessageId = Math.random().toString(36).slice(2, 11);
        if ((0, supabase_1.isSupabaseConfigured)() && conversationId && sessionId) {
            const savedMessage = await (0, chatDbService_1.addMessage)(conversationId, sessionId, 'assistant', teacherResponse);
            savedMessageId = savedMessage.id;
        }
        res.json({
            success: true,
            response: teacherResponse,
            data: {
                id: savedMessageId,
                content: teacherResponse,
                sender: 'ai',
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Chat error:', error);
        const apiError = error;
        if (apiError.status === 401) {
            return res.status(500).json({
                success: false,
                error: 'Invalid Groq API key. Check GROQ_API_KEY in backend/.env.',
            });
        }
        if (apiError.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Groq rate limit exceeded. Please try again in a moment.',
            });
        }
        res.status(500).json({
            success: false,
            error: apiError.message || 'Failed to send message',
        });
    }
});
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map