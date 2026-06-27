"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const supabase_1 = require("../config/supabase");
const chatDbService_1 = require("../services/chatDbService");
const groqService_1 = require("../services/groqService");
const apiErrors_1 = require("../utils/apiErrors");
const DAILY_MESSAGE_LIMIT = Number(process.env.DAILY_MESSAGE_LIMIT) || 30;
const router = (0, express_1.Router)();
router.get('/status', (req, res) => {
    res.json({
        success: true,
        dbEnabled: (0, supabase_1.isSupabaseConfigured)(),
        authRequired: true,
    });
});
router.use(auth_1.requireAuth);
router.get('/conversations', async (req, res) => {
    try {
        const userId = req.userId;
        if (!(0, supabase_1.isSupabaseConfigured)()) {
            return res.status(503).json({ success: false, error: apiErrors_1.USER_ERRORS.SERVICE_UNAVAILABLE });
        }
        const conversations = await (0, chatDbService_1.listConversations)(userId);
        const data = conversations.map((conversation) => (0, chatDbService_1.mapConversationForApi)(conversation));
        res.json({ success: true, data });
    }
    catch (error) {
        (0, apiErrors_1.logServerError)('List conversations', error);
        res.status(500).json({
            success: false,
            error: (0, apiErrors_1.getUserError)(error, apiErrors_1.USER_ERRORS.FAILED_LOAD_CONVERSATIONS),
        });
    }
});
router.post('/conversations', async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;
        if (!(0, supabase_1.isSupabaseConfigured)()) {
            return res.status(503).json({ success: false, error: apiErrors_1.USER_ERRORS.SERVICE_UNAVAILABLE });
        }
        const conversation = await (0, chatDbService_1.createConversation)(userId, title);
        res.status(201).json({
            success: true,
            data: (0, chatDbService_1.mapConversationForApi)(conversation),
        });
    }
    catch (error) {
        (0, apiErrors_1.logServerError)('Create conversation', error);
        res.status(500).json({
            success: false,
            error: (0, apiErrors_1.getUserError)(error, apiErrors_1.USER_ERRORS.FAILED_CREATE_CONVERSATION),
        });
    }
});
router.get('/conversations/:id', async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!(0, supabase_1.isSupabaseConfigured)()) {
            return res.status(503).json({ success: false, error: apiErrors_1.USER_ERRORS.SERVICE_UNAVAILABLE });
        }
        const conversations = await (0, chatDbService_1.listConversations)(userId);
        const conversation = conversations.find((item) => item.id === id);
        if (!conversation) {
            return res.status(404).json({ success: false, error: apiErrors_1.USER_ERRORS.CONVERSATION_NOT_FOUND });
        }
        const messages = await (0, chatDbService_1.getConversationMessages)(id, userId);
        res.json({
            success: true,
            data: (0, chatDbService_1.mapConversationForApi)(conversation, messages),
        });
    }
    catch (error) {
        (0, apiErrors_1.logServerError)('Get conversation', error);
        res.status(500).json({
            success: false,
            error: (0, apiErrors_1.getUserError)(error, apiErrors_1.USER_ERRORS.FAILED_LOAD_CONVERSATION),
        });
    }
});
router.post('/message', async (req, res) => {
    try {
        const userId = req.userId;
        const { message, conversation_id: conversationId } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, error: apiErrors_1.USER_ERRORS.MESSAGE_REQUIRED });
        }
        if (!process.env.GROQ_API_KEY) {
            (0, apiErrors_1.logServerError)('Chat message', new Error('GROQ_API_KEY not configured'));
            return res.status(503).json({ success: false, error: apiErrors_1.USER_ERRORS.AI_UNAVAILABLE });
        }
        if (!(0, supabase_1.isSupabaseConfigured)()) {
            return res.status(503).json({ success: false, error: apiErrors_1.USER_ERRORS.SERVICE_UNAVAILABLE });
        }
        const messagesToday = await (0, chatDbService_1.countUserMessagesToday)(userId);
        if (messagesToday >= DAILY_MESSAGE_LIMIT) {
            return res.status(429).json({
                success: false,
                error: apiErrors_1.USER_ERRORS.DAILY_LIMIT(DAILY_MESSAGE_LIMIT),
            });
        }
        const resolvedConversationId = await (0, chatDbService_1.ensureConversation)(userId, conversationId);
        await (0, chatDbService_1.addMessage)(resolvedConversationId, userId, 'user', message);
        const teacherResponse = await (0, groqService_1.getTeacherResponse)(message);
        const savedMessage = await (0, chatDbService_1.addMessage)(resolvedConversationId, userId, 'assistant', teacherResponse);
        res.json({
            success: true,
            response: teacherResponse,
            conversation_id: resolvedConversationId,
            data: {
                id: savedMessage.id,
                content: teacherResponse,
                sender: 'ai',
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        (0, apiErrors_1.logServerError)('Chat message', error);
        const apiError = error;
        if (apiError.status === 401) {
            return res.status(503).json({ success: false, error: apiErrors_1.USER_ERRORS.AI_UNAVAILABLE });
        }
        if (apiError.status === 429) {
            return res.status(429).json({ success: false, error: apiErrors_1.USER_ERRORS.GROQ_RATE_LIMIT });
        }
        res.status(500).json({
            success: false,
            error: (0, apiErrors_1.getUserError)(error, apiErrors_1.USER_ERRORS.FAILED_SEND_MESSAGE),
        });
    }
});
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map