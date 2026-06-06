import { Router, Request, Response } from 'express';

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
router.post('/message', (req: Request, res: Response) => {
  try {
    const { task_id, message } = req.body;
    res.status(201).json({
      success: true,
      data: {
        id: '1',
        task_id,
        content: 'AI response placeholder',
        sender: 'ai',
        created_at: new Date().toISOString(),
      },
      message: 'Message sent successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send message' });
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
