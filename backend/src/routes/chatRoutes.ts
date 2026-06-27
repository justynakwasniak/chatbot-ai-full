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
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const conversations = await listConversations(userId);
    const data = conversations.map((conversation) => mapConversationForApi(conversation));

    res.json({ success: true, data });
  } catch (error) {
    console.error('List conversations error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch conversations';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { title } = req.body;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const conversation = await createConversation(userId, title);
    res.status(201).json({
      success: true,
      data: mapConversationForApi(conversation),
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create conversation';
    const isRlsError = message.includes('row-level security');

    res.status(500).json({
      success: false,
      error: isRlsError
        ? 'Supabase RLS blocked the request. Use the service_role key as SUPABASE_KEY in backend/.env (not the anon/publishable key).'
        : message,
    });
  }
});

router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const conversations = await listConversations(userId);
    const conversation = conversations.find((item) => item.id === id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const messages = await getConversationMessages(id, userId);

    res.json({
      success: true,
      data: mapConversationForApi(conversation, messages),
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
  }
});

router.post('/message', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { message, conversation_id: conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Groq API key not configured. Add GROQ_API_KEY to backend/.env',
      });
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const messagesToday = await countUserMessagesToday(userId);
    if (messagesToday >= DAILY_MESSAGE_LIMIT) {
      return res.status(429).json({
        success: false,
        error: `Daily limit reached (${DAILY_MESSAGE_LIMIT} messages per user). Try again tomorrow.`,
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
    console.error('Chat error:', error);

    const apiError = error as { status?: number; code?: string; message?: string };

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
      error: apiError.message?.includes('row-level security')
        ? 'Supabase RLS blocked the request. Use the service_role key as SUPABASE_KEY in backend/.env (not the anon/publishable key).'
        : apiError.message || 'Failed to send message',
    });
  }
});

export default router;
