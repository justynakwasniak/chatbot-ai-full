import { Request, Response } from 'express';

export const getAll = async (req: Request, res: Response) => {
  try {
    // TODO: Fetch tasks from Supabase
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Fetch task from Supabase by ID
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch task' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { title, description, priority } = req.body;
    // TODO: Create task in Supabase
    res.status(201).json({
      success: true,
      data: { id: '1', title, description, priority, status: 'todo' },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Update task in Supabase
    res.json({ success: true, data: req.body });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
};

export const delete_ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Delete task from Supabase
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
};
