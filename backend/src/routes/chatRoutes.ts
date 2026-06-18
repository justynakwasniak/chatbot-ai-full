import { Router, Request, Response } from 'express';
import { getTeacherResponse } from '../services/groqService';

const router = Router();

// GET main chat endpoint (for testing in browser)
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Hello from backend - Chat API',
      data: {
        id: '1',
        content: 'Hello from backend',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      },
      note: 'Use POST method to send messages',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process chat message' });
  }
});

// POST main chat endpoint
router.post('/', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Hello from backend',
      data: {
        id: '1',
        content: 'Hello from backend',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process chat message' });
  }
});

// POST send message to AI
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Groq API key not configured. Add GROQ_API_KEY to backend/.env',
      });
    }

    console.log('[Chat Request]');
    console.log('User Message:', message);

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
      error: apiError.message || 'Failed to send message',
    });
  }
});

// GET messages for task
router.get('/task/:task_id', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: [],
      message: 'Messages fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

export default router;
