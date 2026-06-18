"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupabaseConfigured = isSupabaseConfigured;
exports.getSupabase = getSupabase;
exports.isSupabaseServiceRoleKey = isSupabaseServiceRoleKey;
const supabase_js_1 = require("@supabase/supabase-js");
let client = null;
function getSupabaseKeyRole(key) {
    try {
        const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
        return typeof payload.role === 'string' ? payload.role : null;
    }
    catch {
        return null;
    }
}
function isSupabaseConfigured() {
    return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);
}
function getSupabase() {
    if (!isSupabaseConfigured())
        return null;
    if (!client) {
        const key = process.env.SUPABASE_KEY;
        const role = getSupabaseKeyRole(key);
        if (role && role !== 'service_role') {
            console.error(`[Supabase] SUPABASE_KEY has role "${role}". Backend requires the service_role key from Project Settings → API Keys.`);
        }
        client = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, key);
    }
    return client;
}
function isSupabaseServiceRoleKey() {
    const key = process.env.SUPABASE_KEY;
    if (!key)
        return false;
    const role = getSupabaseKeyRole(key);
    return role === 'service_role';
}
//# sourceMappingURL=supabase.js.map