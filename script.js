// script.js
import { supabase } from './supabase.js'

const joinBtn = document.getElementById('joinBtn')
const nameInput = document.getElementById('nameInput')
const statusSection = document.getElementById('statusSection')
const queuePosition = document.getElementById('queuePosition')

let userId = null

joinBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim()
  if (!name) {
    alert('Please enter your name.')
    return
  }

  // Add user to queue
  const { data, error } = await supabase
    .from('queue')
    .insert([{ name, status: 'waiting' }])
    .select()

  if (error) {
    alert('Something went wrong. Please try again.')
    console.error(error)
    return
  }

  userId = data[0].id
  nameInput.style.display = 'none'
  joinBtn.style.display = 'none'
  statusSection.style.display = 'block'

  updatePosition()
  startPolling()
})

async function updatePosition() {
  const { data, error } = await supabase
    .from('queue')
    .select('*')
    .eq('status', 'waiting')
    .order('joined_at', { ascending: true })

  if (error) {
    console.error(error)
    return
  }

  const position = data.findIndex(item => item.id === userId)
  if (position !== -1) {
    queuePosition.innerText = position + 1
  } else {
    queuePosition.innerText = 'Not found'
  }
}

function startPolling() {
  setInterval(updatePosition, 5000) // Update every 5 seconds
}