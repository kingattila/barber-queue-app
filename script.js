import { supabase } from './supabase.js'

const barberSelect = document.getElementById('barberSelect')
const queueContainer = document.getElementById('queueContainer')
const nextCustomerBtn = document.getElementById('nextCustomerBtn')
const statusDisplay = document.getElementById('statusDisplay')

let selectedBarberId = null
let selectedBarberName = null

// Load active barbers
async function loadBarbers() {
  const { data, error } = await supabase
    .from('barbers')
    .select('id, name, status')
    .eq('status', 'active')

  if (error) {
    console.error('Error loading barbers:', error)
    return
  }

  barberSelect.innerHTML = '<option value="">Select your name</option>'
  data.forEach(barber => {
    const option = document.createElement('option')
    option.value = barber.id
    option.textContent = barber.name
    barberSelect.appendChild(option)
  })
}

// Load the combined queue (own + any)
async function loadQueue() {
  if (!selectedBarberId) {
    queueContainer.innerHTML = '<p>Please select your name first.</p>'
    return
  }

  const { data: queue, error } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('status', 'waiting')
    .in('requested_barber_id', [null, selectedBarberId])
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error loading queue:', error)
    queueContainer.innerHTML = 'Failed to load queue.'
    return
  }

  if (!queue || queue.length === 0) {
    queueContainer.innerHTML = '<p>No one is in the queue.</p>'
    return
  }

  queueContainer.innerHTML = ''
  queue.forEach((entry, index) => {
    const div = document.createElement('div')
    div.className = 'queue-entry'
    div.innerHTML = `
      <p><strong>${entry.customer_name}</strong></p>
      <p>Joined at: ${new Date(entry.joined_at).toLocaleTimeString()}</p>
      <p>Position: ${index + 1}</p>
      <p>Type: ${entry.requested_barber_id ? 'Requested You' : 'Any Barber'}</p>
    `
    queueContainer.appendChild(div)
  })
}

// Serve next customer
async function serveNextCustomer() {
  if (!selectedBarberId) return alert('Select your name first.')

  const { data: queue, error } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('status', 'waiting')
    .in('requested_barber_id', [null, selectedBarberId])
    .order('joined_at', { ascending: true })
    .limit(1)

  if (error || !queue || queue.length === 0) {
    alert('No one to serve.')
    return
  }

  const next = queue[0]

  // Mark as served and assign the barber
  const { error: updateError } = await supabase
    .from('queue_entries')
    .update({
      status: 'served',
      requested_barber_id: selectedBarberId
    })
    .eq('id', next.id)

  if (updateError) {
    console.error('Error serving customer:', updateError)
    alert('Failed to serve next customer.')
    return
  }

  statusDisplay.textContent = `✅ Now serving: ${next.customer_name}`
  loadQueue()
}

// When barber selects their name
barberSelect.addEventListener('change', () => {
  selectedBarberId = barberSelect.value
  selectedBarberName = barberSelect.options[barberSelect.selectedIndex].text
  statusDisplay.textContent = ''
  loadQueue()
})

// Button: Serve next
nextCustomerBtn.addEventListener('click', serveNextCustomer)

// Init
loadBarbers()