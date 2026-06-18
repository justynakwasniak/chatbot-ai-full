"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.sendMessage = void 0;
const sendMessage = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const { task_id } = req.params;
        // TODO: Fetch messages from Supabase
        res.json({ success: true, data: [] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
};
exports.getMessages = getMessages;
//# sourceMappingURL=chatController.js.map