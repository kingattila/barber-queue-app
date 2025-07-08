import { supabase } from './supabase.js'

const barberList = document.getElementById('barberList')
const addBarberForm = document.getElementById('addBarberForm')
const barberNameInput = document.getElementById('barberName')

let shopId = null

// Step 1: Load barbershop ID based on slug (e.g., "fadelab")
async function getBarbershopId() {
  const { data, error } = await supabase
    .from("barbershops")
    .select("id")
    .eq("slug", "fadelab")
    .single()

  if (error) {
    console.error('Failed to load barbershop ID:', error)
    return null
  }

  return data.id
}

// Step 2: Load barbers from Supabase
async function loadBarbers() {
  barberList.innerHTML = 'Loading barbers...'

  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('shop_id', shopId)

  if (error) {
    console.error('Error loading barbers:', error)
    return
  }

  barberList.innerHTML = ''

  for (const barber of barbers) {
    const container = document.createElement('div')
    container.className = 'barber-block'

    container.innerHTML = `
      <h3>${barber.name}</h3>
      <p>Status: ${barber.status}</p>
      <button class="toggleStatus" data-id="${barber.id}">
        ${barber.status === 'active' ? 'Deactivate' : 'Activate'}
      </button>
      <button class="removeBarber" data-id="${barber.id}">❌ Remove</button>
    `
    barberList.appendChild(container)
  }

  // Attach event listeners for toggle and remove
  document.querySelectorAll('.toggleStatus').forEach(button =>
    button.addEventListener('click', async (e) => {
      const id = e.target.dataset.id
      const currentStatus = e.target.textContent === 'Deactivate' ? 'active' : 'inactive'
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

      const { error } = await supabase
        .from('barbers')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) {
        console.error('Error toggling status:', error)
        return
      }

      loadBarbers()
    })
  )

  document.querySelectorAll('.removeBarber').forEach(button =>
    button.addEventListener('click', async (e) => {
      const id = e.target.dataset.id
      const confirmed = confirm('Are you sure you want to delete this barber?')

      if (!confirmed) return

      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error removing barber:', error)
        return
      }

      loadBarbers()
    })
  )
}

// Step 3: Handle form submission to add new barber
addBarberForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const name = barberNameInput.value.trim()
  if (!name) return

  const { error } = await supabase
    .from('barbers')
    .insert([{ name, shop_id: shopId, status: 'active' }])

  if (error) {
    console.error('Error adding barber:', error)
    alert('Failed to add barber.')
    return
  }

  barberNameInput.value = ''
  loadBarbers()
})

// Initialize page
getBarbershopId().then(id => {
  if (!id) return
  shopId = id
  loadBarbers()
})