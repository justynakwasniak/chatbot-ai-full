import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { isSupabaseConfigured } from '../config/supabase';
import {
  addMessage,
  countUserMessagesToday,
  createConversation,
  ensureConversation,
  getConversationMessages,
  listConversations,
  mapConversationForApi,
} from '../services/chatDbService';
import { getTeacherResponse } from '../services/groqService';
import { getUserError, logServerError, USER_ERRORS } from '../utils/apiErrors';

const DAILY_MESSAGE_LIMIT = Number(process.env.DAILY_MESSAGE_LIMIT) || 30;

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

router.post('/message', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { message, conversation_id: conversationId } = req.body;

    if (!message) {
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
    await addMessage(resolvedConversationId, userId, 'user', message);

    const teacherResponse = await getTeacherResponse(message);
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

    const apiError = error as { status?: number; message?: string };

    if (apiError.status === 401) {
      return res.status(503).json({ success: false, error: USER_ERRORS.AI_UNAVAILABLE });
    }

    if (apiError.status === 429) {
      return res.status(429).json({ success: false, error: USER_ERRORS.GROQ_RATE_LIMIT });
    }

    res.status(500).json({
      success: false,
      error: getUserError(error, USER_ERRORS.FAILED_SEND_MESSAGE),
    });
  }
});

export default router;
