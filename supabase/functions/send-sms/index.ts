import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import twilio from "npm:twilio";

serve(async (req) => {
  console.log("📩 Request received");

  const { to, message } = await req.json();

  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !from) {
    console.error("❌ Missing env vars");
    return new Response("Missing Twilio credentials", { status: 500 });
  }

  const client = twilio(accountSid, authToken);

  try {
    const result = await client.messages.create({
      body: message,
      from,
      to,
    });

    console.log("✅ SMS sent", result.sid);
    return new Response(JSON.stringify({ sid: result.sid }), { status: 200 });
  } catch (err) {
    console.error("❌ Failed to send SMS:", err);
    return new Response("Failed to send SMS", { status: 500 });
  }
});