import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { id: req.params.id, title: 'Task', status: 'pending' },
  });
});

router.post('/', (req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    data: { id: '1', ...req.body, created_at: new Date().toISOString() },
  });
});

router.put('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { id: req.params.id, ...req.body, updated_at: new Date().toISOString() },
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  res.json({ success: true, data: { id: req.params.id } });
});

export default router;
