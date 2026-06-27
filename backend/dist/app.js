"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const apiErrors_1 = require("./utils/apiErrors");
const app = (0, express_1.default)();
function normalizeOrigin(url) {
    return url.replace(/\/$/, '');
}
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
]
    .filter((origin) => Boolean(origin))
    .map(normalizeOrigin);
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(normalizeOrigin(origin)))
            return callback(null, true);
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Task routes
app.use('/api/tasks', taskRoutes_1.default);
// Chat routes
app.use('/api/chat', chatRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    (0, apiErrors_1.logServerError)(`${req.method} ${req.path}`, err);
    res.status(err.status || 500).json({
        success: false,
        error: (0, apiErrors_1.isProduction)() ? apiErrors_1.USER_ERRORS.SERVICE_UNAVAILABLE : (err.message || 'Internal server error'),
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map