import { Router, Request, Response } from 'express';
import { isSupabaseConfigured } from '../config/supabase';
import {
  addMessage,
  createConversation,
  ensureConversation,
  getConversationMessages,
  listConversations,
  mapConversationForApi,
} from '../services/chatDbService';
import { getTeacherResponse } from '../services/groqService';

const router = Router();

router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    dbEnabled: isSupabaseConfigured(),
  });
});

router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const sessionId = String(req.query.session_id || '');

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'session_id is required' });
    }

    if (!isSupabaseConfigured()) {
      return res.json({ success: true, data: [], dbEnabled: false });
    }

    const conversations = await listConversations(sessionId);
    const data = conversations.map((conversation) => mapConversationForApi(conversation));

    res.json({ success: true, data, dbEnabled: true });
  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const { session_id: sessionId, title } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'session_id is required' });
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const conversation = await createConversation(sessionId, title);
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
    const sessionId = String(req.query.session_id || '');
    const { id } = req.params;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'session_id is required' });
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const conversations = await listConversations(sessionId);
    const conversation = conversations.find((item) => item.id === id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const messages = await getConversationMessages(id, sessionId);

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

    if (isSupabaseConfigured()) {
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'session_id is required when database is enabled',
        });
      }

      const resolvedConversationId = await ensureConversation(sessionId, conversationId);
      await addMessage(resolvedConversationId, sessionId, 'user', message);

      const teacherResponse = await getTeacherResponse(message);
      const savedMessage = await addMessage(resolvedConversationId, sessionId, 'assistant', teacherResponse);

      return res.json({
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

    const teacherResponse = await getTeacherResponse(message);

    res.json({
      success: true,
      response: teacherResponse,
      data: {
        id: Math.random().toString(36).slice(2, 11),
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
