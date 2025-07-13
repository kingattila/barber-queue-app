import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import twilio from 'https://esm.sh/twilio'

serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }

  // ✅ Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers
    })
  }

  // ❌ Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    })
  }

  try {
    const { to, message } = await req.json()

    const sid = Deno.env.get('TWILIO_ACCOUNT_SID')!
    const token = Deno.env.get('TWILIO_AUTH_TOKEN')!
    const from = Deno.env.get('TWILIO_PHONE_NUMBER')!

    const client = twilio(sid, token)
    const result = await client.messages.create({
      body: message,
      from,
      to
    })

    return new Response(JSON.stringify({ success: true, sid: result.sid }), {
      status: 200,
      headers
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers
    })
  }
})