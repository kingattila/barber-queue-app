import { supabase } from './supabase.js'

const barberSelect = document.getElementById('barberSelect')
const nextCustomerDiv = document.getElementById('nextCustomer')
const nextBtn = document.getElementById('nextBtn')

let selectedBarberId = null
let barbershopId = null

// Get barbershop ID
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
  console.log('Loaded barbershop ID:', barbershopId)
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

// Load queue for selected barber
async function loadQueue() {
  nextCustomerDiv.textContent = 'Loading...'
  nextBtn.disabled = true

  if (!selectedBarberId) return

  console.log("Loading queue for barber ID:", selectedBarberId)

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

  console.log("Queue entries loaded:", entries)

  const next = entries[0]

  if (!next) {
    nextCustomerDiv.textContent = 'No one in the queue'
    return
  }

  nextCustomerDiv.textContent = `Customer: ${next.customer_name}`
  nextBtn.disabled = false
  nextBtn.dataset.entryId = next.id
}

// Mark customer as served (instead of deleting)
async function handleNext() {
  const entryId = nextBtn.dataset.entryId
  if (!entryId) return

  const { error } = await supabase
    .from('queue_entries')
    .update({ status: 'served' })
    .eq('id', entryId)
    .eq('shop_id', barbershopId)

  if (error) {
    console.error('Failed to mark customer as served:', error)
    alert('Failed to update queue.')
    return
  }

  loadQueue()
}

// Events
barberSelect.addEventListener('change', () => {
  selectedBarberId = barberSelect.value
  loadQueue()
})

nextBtn.addEventListener('click', handleNext)

// Init
loadBarbershopId()