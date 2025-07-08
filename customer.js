import { supabase } from './supabase.js'

const nameInput = document.getElementById('nameInput')
const barberList = document.getElementById('barberList')

// Fetch barbers with status = 'active'
async function loadBarbers() {
  barberList.innerHTML = 'Loading barbers...'

  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('status', 'active')

  if (error) {
    console.error('Error loading barbers:', error)
    barberList.innerHTML = 'Failed to load barbers.'
    return
  }

  barberList.innerHTML = ''

  // General (any barber) queue
  const generalQueueCount = await getQueueCount(null)

  const generalDiv = document.createElement('div')
  generalDiv.className = 'barber-block'
  generalDiv.innerHTML = `
    <h2>🧍 Any Barber</h2>
    <p>Customers ahead: ${generalQueueCount}</p>
    <button onclick="joinQueue(null)">Join</button>
  `
  barberList.appendChild(generalDiv)

  // Specific barbers
  for (const barber of barbers) {
    const count = await getQueueCount(barber.id)
    const block = document.createElement('div')
    block.className = 'barber-block'
    block.innerHTML = `
      <h2>✂️ ${barber.name}</h2>
      <p>Customers ahead: ${count}</p>
      <button onclick="joinQueue('${barber.id}')">Join ${barber.name}</button>
    `
    barberList.appendChild(block)
  }
}

// Count customers in queue for a given barber (null for any)
async function getQueueCount(barberId) {
  let query = supabase
    .from('queue_entries')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'waiting')

  if (barberId === null) {
    query = query.is('requested_barber_id', null)
  } else {
    query = query.eq('requested_barber_id', barberId)
  }

  const { count, error } = await query

  if (error) {
    console.error('Error fetching queue count:', error)
    return 0
  }

  return count
}

// Join queue for a specific or any barber
window.joinQueue = async function (barberId) {
  const name = nameInput.value.trim()
  if (!name) {
    alert('Please enter your name')
    return
  }

  // 🔑 Get shop ID from 'fadelab'
  const { data: shop, error: shopError } = await supabase
    .from('barbershops')
    .select('id')
    .eq('slug', 'fadelab')
    .single()

  if (shopError || !shop) {
    console.error('Failed to load shop ID:', shopError)
    alert('Something went wrong. Please try again.')
    return
  }

  const { error } = await supabase.from('queue_entries').insert({
    customer_name: name,
    requested_barber_id: barberId,
    status: 'waiting',
    shop_id: shop.id  // ✅ Assign the correct shop_id
  })

  if (error) {
    console.error('Error joining queue:', error)
    alert('Something went wrong joining the queue.')
    return
  }

  alert('You’ve been added to the queue!')
  location.reload()
}

loadBarbers()