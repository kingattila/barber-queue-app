import { supabase } from './supabase.js'

const barberList = document.getElementById('barberList')
const addBarberForm = document.getElementById('addBarberForm')
const barberNameInput = document.getElementById('barberName')

let barbershopId = null

// Load barbershop ID using slug
async function getBarbershopId() {
  const { data, error } = await supabase
    .from("barbershops")
    .select("*")
    .eq("slug", "fadelab")
    .single()

  if (error) {
    console.error('Failed to load barbershop ID:', error)
    return null
  }

  return data.id
}

// Load barbers
async function loadBarbers() {
  barberList.innerHTML = 'Loading barbers...'

  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('shop_id', barbershopId)

  if (error) {
    console.error('Error loading barbers:', error)
    barberList.innerHTML = 'Failed to load barbers.'
    return
  }

  barberList.innerHTML = ''

  for (const barber of barbers) {
    const container = document.createElement('div')
    container.className = 'barber-block'

    container.innerHTML = `
      <h3>${barber.name}</h3>
      <p>Status: ${barber.status}</p>
      <button class="toggleStatus" data-id="${barber.id}" data-status="${barber.status}">
        ${barber.status === 'active' ? 'Deactivate' : 'Activate'}
      </button>
      <button class="removeBarber" data-id="${barber.id}">❌ Remove</button>
    `
    barberList.appendChild(container)
  }

  attachEventListeners()
}

// Attach button click events
function attachEventListeners() {
  document.querySelectorAll('.toggleStatus').forEach(button =>
    button.addEventListener('click', async (e) => {
      e.preventDefault()

      const id = e.target.dataset.id
      const currentStatus = e.target.dataset.status
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

      console.log("Toggling barber ID:", id, "from", currentStatus, "to", newStatus)

      const { error } = await supabase
        .from('barbers')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) {
        console.error('Error toggling status:', error)
        alert("Failed to update status.")
        return
      }

      loadBarbers()
    })
  )

  document.querySelectorAll('.removeBarber').forEach(button =>
    button.addEventListener('click', async (e) => {
      e.preventDefault()

      const id = e.target.dataset.id
      const confirmed = confirm('Are you sure you want to delete this barber?')
      if (!confirmed) return

      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error removing barber:', error)
        alert("Failed to delete barber.")
        return
      }

      loadBarbers()
    })
  )
}

// Handle add barber form
addBarberForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const name = barberNameInput.value.trim()
  if (!name) return

  const { error } = await supabase
    .from('barbers')
    .insert([{ name, shop_id: barbershopId, status: 'active' }])

  if (error) {
    console.error('Error adding barber:', error)
    alert('Failed to add barber.')
    return
  }

  barberNameInput.value = ''
  loadBarbers()
})

// Init
getBarbershopId().then(id => {
  if (!id) return
  barbershopId = id
  loadBarbers()
})