import { Router, Request, Response } from 'express';

const router = Router();

// GET all tasks
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: [],
      message: 'Tasks fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});

// POST create task
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    res.status(201).json({
      success: true,
      data: { id: '1', title, description, status: 'todo', priority: 'medium' },
      message: 'Task created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

// GET task by id
router.get('/:id', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: { id: req.params.id, title: '', description: '', status: 'todo' },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch task' });
  }
});

// PUT update task
router.put('/:id', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: req.body,
      message: 'Task updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// DELETE task
router.delete('/:id', (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

export default router;
