import { supabase } from './supabase.js'

const barberSelect = document.getElementById('barberSelect')
const nextCustomerDiv = document.getElementById('nextCustomer')
const nextBtn = document.getElementById('nextBtn')

let currentBarberId = null

// Load all active barbers
async function loadBarbers() {
  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('status', 'active')

  if (error) {
    console.error('Error loading barbers:', error)
    barberSelect.innerHTML = `<option disabled selected>Failed to load</option>`
    return
  }

  barberSelect.innerHTML = `<option disabled selected>Select your name</option>`

  for (const barber of barbers) {
    const option = document.createElement('option')
    option.value = barber.id
    option.textContent = barber.name
    barberSelect.appendChild(option)
  }
}

// Load next customer for the current barber
async function loadNextCustomer() {
  if (!currentBarberId) {
    nextCustomerDiv.textContent = 'Please select your name above.'
    nextBtn.disabled = true
    return
  }

  const { data, error } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('status', 'waiting')
    .or(`requested_barber_id.eq.${currentBarberId},requested_barber_id.is.null`)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) {
    console.error('Error loading next customer:', error)
    nextCustomerDiv.textContent = 'Failed to load queue'
    nextBtn.disabled = true
    return
  }

  if (data.length === 0) {
    nextCustomerDiv.textContent = 'No one in the queue'
    nextBtn.disabled = true
  } else {
    nextCustomerDiv.textContent = `${data[0].customer_name}`
    nextBtn.disabled = false
  }
}

// Mark next customer as served
async function handleNext() {
  const { data, error } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('status', 'waiting')
    .or(`requested_barber_id.eq.${currentBarberId},requested_barber_id.is.null`)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error || data.length === 0) {
    console.error('Error getting next customer to update:', error)
    return
  }

  const customerId = data[0].id

  const { error: updateError } = await supabase
    .from('queue_entries')
    .update({ status: 'served' })
    .eq('id', customerId)

  if (updateError) {
    console.error('Error updating customer:', updateError)
    return
  }

  loadNextCustomer()
}

// Barber selection change
barberSelect.addEventListener('change', (e) => {
  currentBarberId = e.target.value
  loadNextCustomer()
})

nextBtn.addEventListener('click', handleNext)

// Initialize
loadBarbers()