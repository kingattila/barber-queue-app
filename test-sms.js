import fetch from 'node-fetch'

const res = await fetch('https://ylsodxvamypauwlwizkf.supabase.co/functions/v1/send-sms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsc29keHZhbXZwYXV3bHdpemtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NDY1MDYsImV4cCI6MjA2NzQyMjUwNn0.4k0PjrPMugDCOS_Y5SuCpm6u-ycSXmO75xqxdHCtW4c'
  },
  body: JSON.stringify({
    to: '+61405253462',
    message: 'You’re up next at Fade Lab!'
  })
})

const data = await res.json()
console.log(data)