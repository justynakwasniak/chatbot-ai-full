"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({ success: true, data: [] });
});
router.get('/:id', (req, res) => {
    res.json({
        success: true,
        data: { id: req.params.id, title: 'Task', status: 'pending' },
    });
});
router.post('/', (req, res) => {
    res.status(201).json({
        success: true,
        data: { id: '1', ...req.body, created_at: new Date().toISOString() },
    });
});
router.put('/:id', (req, res) => {
    res.json({
        success: true,
        data: { id: req.params.id, ...req.body, updated_at: new Date().toISOString() },
    });
});
router.delete('/:id', (req, res) => {
    res.json({ success: true, data: { id: req.params.id } });
});
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map