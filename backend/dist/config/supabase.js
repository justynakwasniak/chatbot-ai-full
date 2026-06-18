"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupabaseConfigured = isSupabaseConfigured;
exports.getSupabase = getSupabase;
const supabase_js_1 = require("@supabase/supabase-js");
let client = null;
function isSupabaseConfigured() {
    return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);
}
function getSupabase() {
    if (!isSupabaseConfigured())
        return null;
    if (!client) {
        client = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    }
    return client;
}
//# sourceMappingURL=supabase.js.map