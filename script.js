import { supabase } from './supabase.js'

const barberSelect = document.getElementById('barberSelect')
const nextCustomerDiv = document.getElementById('nextCustomer')
const nextBtn = document.getElementById('nextBtn')
const skipBtn = document.getElementById('skipBtn')
const removeBtn = document.getElementById('removeBtn')

let selectedBarberId = null
let barbershopId = null
let currentEntry = null

// Load barbershop ID
async function loadBarbershopId() {
  const { data, error } = await supabase
    .from('barbershops')
    .select('*')
    .eq('slug', 'fadelab')
    .single()

  if (error) {
    console.error('Failed to load barbershop:', error)
    return
  }

  barbershopId = data.id
  loadBarbers()
}

// Load barbers into dropdown
async function loadBarbers() {
  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('shop_id', barbershopId)
    .eq('status', 'active')

  if (error) {
    console.error('Failed to load barbers:', error)
    return
  }

  barberSelect.innerHTML = '<option disabled selected>Select barber</option>'

  for (const barber of barbers) {
    const option = document.createElement('option')
    option.value = barber.id
    option.textContent = barber.name
    barberSelect.appendChild(option)
  }
}

// Load queue
async function loadQueue() {
  nextCustomerDiv.textContent = 'Loading...'
  nextBtn.disabled = true
  skipBtn.disabled = true
  removeBtn.disabled = true
  currentEntry = null

  if (!selectedBarberId) return

  const { data: entries, error } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('shop_id', barbershopId)
    .eq('status', 'waiting')
    .or(`requested_barber_id.eq.${selectedBarberId},requested_barber_id.is.null`)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Failed to load queue:', error)
    nextCustomerDiv.textContent = 'Error loading queue'
    return
  }

  const next = entries[0]
  const second = entries[1]

  if (!next) {
    nextCustomerDiv.textContent = 'No one in the queue'
    return
  }

  currentEntry = { ...next, secondEntry: second }
  nextCustomerDiv.textContent = `Customer: ${next.customer_name}`
  nextBtn.disabled = false
  skipBtn.disabled = false
  removeBtn.disabled = false
}

// Handle Serve
async function handleServe() {
  if (!currentEntry) return

  const { error } = await supabase
    .from('queue_entries')
    .update({ status: 'served' })
    .eq('id', currentEntry.id)
    .eq('shop_id', barbershopId)

  if (error) {
    console.error('Failed to serve:', error)
    alert('Error updating queue.')
    return
  }

  loadQueue()
}

// Handle Skip (bump to second)
async function handleSkip() {
  if (!currentEntry || !currentEntry.secondEntry) {
    alert("Can't skip — no one behind them.")
    return
  }

  const secondTime = new Date(currentEntry.secondEntry.joined_at).getTime()
  const bumpedTime = new Date(secondTime + 1).toISOString()

  const { error } = await supabase
    .from('queue_entries')
    .update({ joined_at: bumpedTime })
    .eq('id', currentEntry.id)
    .eq('shop_id', barbershopId)

  if (error) {
    console.error('Failed to skip:', error)
    alert('Error skipping customer.')
    return
  }

  loadQueue()
}

// Handle Remove
async function handleRemove() {
  if (!currentEntry) return

  const confirmed = confirm(`Remove ${currentEntry.customer_name} from the queue?`)
  if (!confirmed) return

  const { error } = await supabase
    .from('queue_entries')
    .delete()
    .eq('id', currentEntry.id)
    .eq('shop_id', barbershopId)

  if (error) {
    console.error('Failed to remove:', error)
    alert('Error removing customer.')
    return
  }

  loadQueue()
}

// Events
barberSelect.addEventListener('change', () => {
  selectedBarberId = barberSelect.value
  loadQueue()
})

nextBtn.addEventListener('click', handleServe)
skipBtn.addEventListener('click', handleSkip)
removeBtn.addEventListener('click', handleRemove)

// Init
loadBarbershopId()