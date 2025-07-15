import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICEROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables.");
}

const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

serve(async (req) => {
  console.log("Function triggered.");

  try {
    const { data: queueEntries, error } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("notified", false)
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Supabase query error:", error.message);
      return new Response("Database query failed", { status: 500 });
    }

    console.log("Fetched queue entries:", queueEntries);

    // TEMP: Don't actually send SMS for debugging
    return new Response(JSON.stringify({ entries: queueEntries }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error:", err.message);
    return new Response("Internal Server Error", { status: 500 });
  }
});