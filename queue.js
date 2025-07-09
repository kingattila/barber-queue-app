import { supabase } from './supabase.js'

const queueList = document.getElementById('queueList')
let barbershopId = null

// Fetch shop ID
async function getShopId() {
  const { data, error } = await supabase
    .from("barbershops")
    .select("*")
    .eq("slug", "fadelab")
    .single()

  if (error) {
    console.error('Error loading barbershop:', error)
    queueList.textContent = 'Failed to load barbershop.'
    return
  }

  barbershopId = data.id
  loadQueue()
}

// Load all waiting queue entries
async function loadQueue() {
  queueList.innerHTML = 'Loading queue...'

  const { data: entries, error } = await supabase
    .from('queue_entries')
    .select('id, customer_name, requested_barber_id, joined_at')
    .eq('shop_id', barbershopId)
    .eq('status', 'waiting')
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error loading queue:', error)
    queueList.textContent = 'Error loading queue.'
    return
  }

  if (entries.length === 0) {
    queueList.textContent = 'No one is currently in the queue.'
    return
  }

  let html = ''
  for (const entry of entries) {
    const barberName = await getBarberName(entry.requested_barber_id)
    const joined = new Date(entry.joined_at).toLocaleTimeString()
    html += `
      <div class="barber-block">
        <strong>${entry.customer_name}</strong><br>
        Barber: ${barberName}<br>
        Joined: ${joined}<br>
        <button onclick="removeEntry('${entry.id}')">❌ Remove</button>
      </div>
    `
  }

  queueList.innerHTML = html
}

// Helper to look up barber name
async function getBarberName(barberId) {
  if (!barberId) return 'Any Barber'

  const { data, error } = await supabase
    .from('barbers')
    .select('name')
    .eq('id', barberId)
    .single()

  if (error || !data) return 'Unknown'
  return data.name
}

// Remove person from queue
window.removeEntry = async function (id) {
  const confirmed = confirm("Are you sure you want to remove this customer?")
  if (!confirmed) return

  const { error } = await supabase
    .from('queue_entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to remove:', error)
    alert('Error removing entry.')
    return
  }

  loadQueue()
}

getShopId()