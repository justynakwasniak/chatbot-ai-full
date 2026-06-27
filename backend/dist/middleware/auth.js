"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const supabase_1 = require("../config/supabase");
const apiErrors_1 = require("../utils/apiErrors");
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: apiErrors_1.USER_ERRORS.UNAUTHORIZED });
    }
    const token = authHeader.slice(7);
    const supabase = (0, supabase_1.getSupabase)();
    if (!supabase) {
        return res.status(503).json({ success: false, error: apiErrors_1.USER_ERRORS.SERVICE_UNAVAILABLE });
    }
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ success: false, error: apiErrors_1.USER_ERRORS.SESSION_EXPIRED });
    }
    req.userId = user.id;
    next();
}
//# sourceMappingURL=auth.js.map