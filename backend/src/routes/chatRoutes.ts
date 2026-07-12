import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { isSupabaseConfigured } from '../config/supabase';
import {
  addMessage,
  countUserMessagesToday,
  createConversation,
  deleteConversation,
  ensureConversation,
  getConversationMessages,
  listConversations,
  mapConversationForApi,
} from '../services/chatDbService';
import { getTeacherResponse } from '../services/groqService';
import { getHttpStatus, getUserError, logServerError, USER_ERRORS } from '../utils/apiErrors';
import { parseAttachments } from '../utils/attachments';

const DAILY_MESSAGE_LIMIT = Number(process.env.DAILY_MESSAGE_LIMIT) || 50;
const CHAT_HISTORY_LIMIT = Number(process.env.CHAT_HISTORY_LIMIT) || 20;

const router = Router();

router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    dbEnabled: isSupabaseConfigured(),
    authRequired: true,
  });
});

router.use(requireAuth);

router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: USER_ERRORS.SERVICE_UNAVAILABLE });
    }

    const conversations = await listConversations(userId);
    const data = conversations.map((conversation) => mapConversationForApi(conversation));

    res.json({ success: true, data });
  } catch (error) {
    logServerError('List conversations', error);
    res.status(500).json({
      success: false,
      error: getUserError(error, USER_ERRORS.FAILED_LOAD_CONVERSATIONS),
    });
  }
});

router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { title } = req.body;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: USER_ERRORS.SERVICE_UNAVAILABLE });
    }

    const conversation = await createConversation(userId, title);
    res.status(201).json({
      success: true,
      data: mapConversationForApi(conversation),
    });
  } catch (error) {
    logServerError('Create conversation', error);
    res.status(500).json({
      success: false,
      error: getUserError(error, USER_ERRORS.FAILED_CREATE_CONVERSATION),
    });
  }
});

router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: USER_ERRORS.SERVICE_UNAVAILABLE });
    }

    const conversations = await listConversations(userId);
    const conversation = conversations.find((item) => item.id === id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: USER_ERRORS.CONVERSATION_NOT_FOUND });
    }

    const messages = await getConversationMessages(id, userId);

    res.json({
      success: true,
      data: mapConversationForApi(conversation, messages),
    });
  } catch (error) {
    logServerError('Get conversation', error);
    res.status(500).json({
      success: false,
      error: getUserError(error, USER_ERRORS.FAILED_LOAD_CONVERSATION),
    });
  }
});

router.delete('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: USER_ERRORS.SERVICE_UNAVAILABLE });
    }

    await deleteConversation(id, userId);
    res.json({ success: true });
  } catch (error) {
    logServerError('Delete conversation', error);

    if (error instanceof Error && error.message.includes('Conversation not found')) {
      return res.status(404).json({ success: false, error: USER_ERRORS.CONVERSATION_NOT_FOUND });
    }

    res.status(500).json({
      success: false,
      error: getUserError(error, USER_ERRORS.FAILED_DELETE_CONVERSATION),
    });
  }
});

router.post('/message', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { message, conversation_id: conversationId, attachments: rawAttachments } = req.body;
    const messageText = typeof message === 'string' ? message.trim() : '';

    let attachments;
    try {
      attachments = parseAttachments(rawAttachments);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: getUserError(error, USER_ERRORS.INVALID_ATTACHMENTS),
      });
    }

    if (!messageText && attachments.length === 0) {
      return res.status(400).json({ success: false, error: USER_ERRORS.MESSAGE_REQUIRED });
    }

    if (!process.env.GROQ_API_KEY) {
      logServerError('Chat message', new Error('GROQ_API_KEY not configured'));
      return res.status(503).json({ success: false, error: USER_ERRORS.AI_UNAVAILABLE });
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: USER_ERRORS.SERVICE_UNAVAILABLE });
    }

    const messagesToday = await countUserMessagesToday(userId);
    if (messagesToday >= DAILY_MESSAGE_LIMIT) {
      return res.status(429).json({
        success: false,
        error: USER_ERRORS.DAILY_LIMIT(DAILY_MESSAGE_LIMIT),
      });
    }

    const resolvedConversationId = await ensureConversation(userId, conversationId);
    await addMessage(resolvedConversationId, userId, 'user', messageText, attachments);

    const storedMessages = await getConversationMessages(resolvedConversationId, userId);
    const history = storedMessages.slice(-CHAT_HISTORY_LIMIT).map((item) => ({
      role: item.role,
      content: item.content,
      attachments: item.attachments ?? [],
    }));

    const teacherResponse = await getTeacherResponse(history);
    const savedMessage = await addMessage(resolvedConversationId, userId, 'assistant', teacherResponse);

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
  } catch (error: unknown) {
    logServerError('Chat message', error);

    const status = getHttpStatus(error);

    if (status === 401) {
      return res.status(503).json({ success: false, error: USER_ERRORS.AI_UNAVAILABLE });
    }

    if (status === 429) {
      return res.status(429).json({ success: false, error: USER_ERRORS.GROQ_RATE_LIMIT });
    }

    res.status(500).json({
      success: false,
      error: getUserError(error, USER_ERRORS.FAILED_SEND_MESSAGE),
    });
  }
});

export default router;
