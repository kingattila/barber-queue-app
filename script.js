import { supabase } from './supabase.js'

const barberSelect = document.getElementById('barberSelect')
const nextBtn = document.getElementById('nextBtn')
const nextCustomer = document.getElementById('nextCustomer')
const addBarberForm = document.getElementById('add-barber-form')
const newBarberNameInput = document.getElementById('newBarberName')

let selectedBarber = null
let barbershopId = null

// Load active barbers
async function loadBarbers() {
  // Step 1: Get the barbershop ID (for now we're using Fadelab)
  const { data: shops, error: shopError } = await supabase
    .from('barbershops')
    .select('*')
    .eq('slug', 'fadelab')
    .single()

  if (shopError || !shops) {
    console.error('Failed to load barbershop:', shopError)
    return
  }

  barbershopId = shops.id

  // Step 2: Load barbers linked to that shop with status = active
  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('shop_id', barbershopId)
    .eq('status', 'active')

  if (error) {
    console.error('Error loading barbers:', error)
    return
  }

  barberSelect.innerHTML = ''
  for (const barber of barbers) {
    const option = document.createElement('option')
    option.value = barber.id
    option.textContent = barber.name
    barberSelect.appendChild(option)
  }

  selectedBarber = barbers[0]?.id || null
  if (selectedBarber) {
    nextBtn.disabled = false
    getNextCustomer()
  }
}

// On change barber
barberSelect.addEventListener('change', () => {
  selectedBarber = barberSelect.value
  getNextCustomer()
})

// Press "Next" button
nextBtn.addEventListener('click', async () => {
  if (!selectedBarber) return

  const { data: queue, error } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('status', 'waiting')
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error fetching queue:', error)
    return
  }

  const next = queue.find(entry =>
    !entry.requested_barber_id || entry.requested_barber_id === selectedBarber
  )

  if (!next) {
    nextCustomer.textContent = 'No one in the queue'
    return
  }

  await supabase
    .from('queue_entries')
    .update({ status: 'completed' })
    .eq('id', next.id)

  nextCustomer.textContent = `${next.customer_name}`
})

// Add new barber
addBarberForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const newName = newBarberNameInput.value.trim()
  if (!newName) return alert('Enter a name')

  const { error } = await supabase
    .from('barbers')
    .insert({ name: newName, shop_id: barbershopId, status: 'active' })

  if (error) {
    console.error('Error adding barber:', error)
    return alert('Failed to add barber')
  }

  newBarberNameInput.value = ''
  await loadBarbers()
})

loadBarbers()