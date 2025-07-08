import { supabase } from './supabase.js'

const nameInput = document.getElementById('nameInput')
const barberList = document.getElementById('barberList')

async function loadBarbers() {
  const { data: barbers, error } = await supabase.from('barbers').select('*')
  if (error) {
    console.error('Error loading barbers:', error)
    return
  }

  const generalQueueCount = await getQueueCount(null)

  const generalDiv = document.createElement('div')
  generalDiv.className = 'barber-block'
  generalDiv.innerHTML = `
    <h2>🧍 Any Barber</h2>
    <p>Customers ahead: ${generalQueueCount}</p>
    <button onclick="joinQueue(null)">Join</button>
  `
  barberList.appendChild(generalDiv)

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

async function getQueueCount(barberId) {
  const baseQuery = supabase
    .from('queue_entries')
    .select('joined_at, requested_barber_id')
    .eq('status', 'waiting')

  const { data, error } = barberId
    ? await baseQuery.or(`requested_barber_id.eq.${barberId},requested_barber_id.is.null`)
    : await baseQuery.eq('requested_barber_id', null)

  if (error) {
    console.error('Error getting queue count:', error)
    return 0
  }

  return data.length
}

window.joinQueue = async function (barberId) {
  const name = nameInput.value.trim()
  if (!name) return alert('Please enter your name')

  const { error } = await supabase.from('queue_entries').insert({
    customer_name: name,
    requested_barber_id: barberId,
    status: 'waiting'
  })

  if (error) {
    console.error('Error joining queue:', error)
    return alert('Something went wrong joining the queue')
  }

  alert('You’ve been added to the queue!')
  location.reload()
}

loadBarbers()