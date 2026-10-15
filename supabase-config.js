// ========================================================
// ALIZONE - Supabase Client Configuration
// ========================================================

// 1. Apna Supabase Project URL yahan paste karein (e.g. "https://xyzcompany.supabase.co")
const SUPABASE_URL = "https://xopevmbjvwmqvwrwvgmm.supabase.co";

// 2. Apni Supabase "anon" / "public" key yahan paste karein
// (Khabardar: service_role key yahan hargiz na dalein!)
const SUPABASE_ANON_KEY = "sb_publishable_xp6hRnlsmvL-mzO96YGoqQ_rpcFVULQ";

// 3. Supabase Client Initialization
let supabaseClient = null;

if (typeof supabase !== "undefined" && SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL") {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase Client initialized successfully!");
} else {
    console.warn("⚠️ Supabase Client abhi configure nahi hua. Barah-e-karam SUPABASE_URL aur SUPABASE_ANON_KEY darj karein.");
}

// 4. Test Connection Function (Connection check karne ke liye)
async function testSupabaseConnection() {
    if (!supabaseClient) {
        console.error("❌ Supabase client ready nahi hai. supabase-config.js mein URL aur anon key check karein.");
        return false;
    }

    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error("❌ Supabase connection error:", error.message);
            return false;
        }
        console.log("🎉 Supabase connection test PASSED! Database aur Auth ready hain.");
        return true;
    } catch (err) {
        console.error("❌ Supabase connection exception:", err);
        return false;
    }
}
