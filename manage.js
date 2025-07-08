import { supabase } from './supabase.js'

const barberList = document.getElementById('barberList')
const addBarberForm = document.getElementById('addBarberForm')
const barberNameInput = document.getElementById('barberName')

async function loadBarbers() {
  const { data, error } = await supabase.from('barbers').select('*')
  if (error) {
    console.error('Failed to load barbers:', error)
    barberList.textContent = 'Error loading barbers'
    return
  }

  barberList.innerHTML = ''
  data.forEach((barber) => {
    const div = document.createElement('div')
    div.textContent = `${barber.name} (${barber.status})`
    barberList.appendChild(div)
  })
}

addBarberForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const name = barberNameInput.value.trim()
  if (!name) return alert('Please enter a name.')

  const { data: shopData, error: shopError } = await supabase
    .from('barbershops')
    .select('id')
    .eq('slug', 'fadelab')
    .single()

  if (shopError) {
    console.error('Error finding barbershop:', shopError)
    return alert('Could not find barbershop.')
  }

  const { error } = await supabase.from('barbers').insert({
    name,
    shop_id: shopData.id,
    status: 'active'
  })

  if (error) {
    console.error('Error adding barber:', error)
    return alert('Failed to add barber.')
  }

  barberNameInput.value = ''
  loadBarbers()
})

loadBarbers()