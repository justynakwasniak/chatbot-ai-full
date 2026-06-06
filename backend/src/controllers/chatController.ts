import { Request, Response } from 'express';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { task_id, message } = req.body;
    // TODO: Send message to AI service
    // TODO: Store message in Supabase
    res.status(201).json({
      success: true,
      data: {
        id: '1',
        task_id,
        content: 'AI response',
        sender: 'ai',
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { task_id } = req.params;
    // TODO: Fetch messages from Supabase
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};
