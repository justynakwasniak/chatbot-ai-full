import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Request, Response, NextFunction } from 'express';
import { USER_ERRORS } from '../utils/apiErrors';

vi.mock('../middleware/auth', () => ({
  requireAuth: (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: USER_ERRORS.UNAUTHORIZED });
    }
    req.userId = 'user-test-1';
    next();
  },
}));

vi.mock('../config/supabase', () => ({
  isSupabaseConfigured: vi.fn(() => true),
  getSupabase: vi.fn(),
}));

vi.mock('../services/chatDbService', () => ({
  addMessage: vi.fn(),
  countUserMessagesToday: vi.fn(),
  createConversation: vi.fn(),
  deleteConversation: vi.fn(),
  ensureConversation: vi.fn(),
  getConversationMessages: vi.fn(),
  listConversations: vi.fn(),
  mapConversationForApi: vi.fn(),
}));

vi.mock('../services/groqService', () => ({
  getTeacherResponse: vi.fn(),
}));

import app from '../app';
import { isSupabaseConfigured } from '../config/supabase';
import {
  addMessage,
  countUserMessagesToday,
  ensureConversation,
  getConversationMessages,
} from '../services/chatDbService';
import { getTeacherResponse } from '../services/groqService';

const mockedIsSupabaseConfigured = vi.mocked(isSupabaseConfigured);
const mockedCountToday = vi.mocked(countUserMessagesToday);
const mockedEnsureConversation = vi.mocked(ensureConversation);
const mockedAddMessage = vi.mocked(addMessage);
const mockedGetMessages = vi.mocked(getConversationMessages);
const mockedGetTeacherResponse = vi.mocked(getTeacherResponse);

describe('POST /api/chat/message', () => {
  const conversationId = 'conv-1';
  const authHeader = { Authorization: 'Bearer test-token' };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROQ_API_KEY = 'test-groq-key';
    process.env.NODE_ENV = 'test';

    mockedIsSupabaseConfigured.mockReturnValue(true);
    mockedCountToday.mockResolvedValue(0);
    mockedEnsureConversation.mockResolvedValue(conversationId);
    mockedGetMessages.mockResolvedValue([
      {
        id: 'm1',
        conversation_id: conversationId,
        role: 'user',
        content: 'Hola',
        created_at: new Date().toISOString(),
      },
    ]);
    mockedAddMessage
      .mockResolvedValueOnce({
        id: 'user-msg',
        conversation_id: conversationId,
        role: 'user',
        content: 'Hola',
        created_at: new Date().toISOString(),
      })
      .mockResolvedValueOnce({
        id: 'ai-msg',
        conversation_id: conversationId,
        role: 'assistant',
        content: '¡Hola! ¿Cómo estás?',
        created_at: new Date().toISOString(),
      });
    mockedGetTeacherResponse.mockResolvedValue('¡Hola! ¿Cómo estás?');
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request(app).post('/api/chat/message').send({ message: 'Hola' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, error: USER_ERRORS.UNAUTHORIZED });
  });

  it('returns 400 when message and attachments are empty', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .set(authHeader)
      .send({ message: '   ', conversation_id: conversationId });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, error: USER_ERRORS.MESSAGE_REQUIRED });
  });

  it('returns 400 for invalid attachments', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .set(authHeader)
      .send({
        message: 'check this',
        conversation_id: conversationId,
        attachments: [{ id: '1', name: 'x.pdf', mimeType: 'application/pdf' }],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/attachment/i);
  });

  it('returns 503 when Groq is not configured', async () => {
    delete process.env.GROQ_API_KEY;

    const res = await request(app)
      .post('/api/chat/message')
      .set(authHeader)
      .send({ message: 'Hola', conversation_id: conversationId });

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ success: false, error: USER_ERRORS.AI_UNAVAILABLE });
  });

  it('returns 429 when daily message limit is reached', async () => {
    mockedCountToday.mockResolvedValue(999);

    const res = await request(app)
      .post('/api/chat/message')
      .set(authHeader)
      .send({ message: 'Hola', conversation_id: conversationId });

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Daily limit reached/i);
    expect(mockedGetTeacherResponse).not.toHaveBeenCalled();
  });

  it('returns AI reply on happy path', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .set(authHeader)
      .send({ message: 'Hola', conversation_id: conversationId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.response).toBe('¡Hola! ¿Cómo estás?');
    expect(res.body.conversation_id).toBe(conversationId);
    expect(res.body.data).toMatchObject({
      id: 'ai-msg',
      content: '¡Hola! ¿Cómo estás?',
      sender: 'ai',
    });

    expect(mockedEnsureConversation).toHaveBeenCalledWith('user-test-1', conversationId);
    expect(mockedAddMessage).toHaveBeenCalledWith(
      conversationId,
      'user-test-1',
      'user',
      'Hola',
      [],
    );
    expect(mockedGetTeacherResponse).toHaveBeenCalledOnce();
  });

  it('accepts image-only message with attachments', async () => {
    const attachment = {
      id: 'img-1',
      name: 'photo.jpg',
      mimeType: 'image/jpeg',
      dataUrl: 'data:image/jpeg;base64,abc',
    };

    mockedAddMessage.mockReset();
    mockedAddMessage
      .mockResolvedValueOnce({
        id: 'user-msg',
        conversation_id: conversationId,
        role: 'user',
        content: '',
        attachments: [attachment],
        created_at: new Date().toISOString(),
      })
      .mockResolvedValueOnce({
        id: 'ai-msg',
        conversation_id: conversationId,
        role: 'assistant',
        content: 'Veo una foto.',
        created_at: new Date().toISOString(),
      });
    mockedGetTeacherResponse.mockResolvedValue('Veo una foto.');

    const res = await request(app)
      .post('/api/chat/message')
      .set(authHeader)
      .send({
        message: '',
        conversation_id: conversationId,
        attachments: [attachment],
      });

    expect(res.status).toBe(200);
    expect(res.body.response).toBe('Veo una foto.');
    expect(mockedAddMessage).toHaveBeenCalledWith(
      conversationId,
      'user-test-1',
      'user',
      '',
      [attachment],
    );
  });
});
