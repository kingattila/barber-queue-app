require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🧹 Clears and reassigns all "waiting" customers from a given barber
async function clearBarberQueue(barberId) {
  if (!barberId) {
    console.error('Barber ID is required');
    return;
  }

  // Step 1: Fetch affected queue entries
  const { data: entries, error } = await supabase
    .from('queue_entries')
    .select('id, requested_barber_id, joined_at, status')
    .eq('requested_barber_id', barberId)
    .eq('status', 'waiting');

  if (error) {
    console.error('Failed to fetch queue entries:', error.message);
    return;
  }

  if (entries.length === 0) {
    console.log('✅ No waiting customers to reassign.');
    return;
  }

  // Step 2: Reassign to null (i.e., "Any Barber") but preserve order
  const ids = entries.map(e => e.id);

  const { error: updateError } = await supabase
    .from('queue_entries')
    .update({ requested_barber_id: null })
    .in('id', ids);

  if (updateError) {
    console.error('❌ Failed to reassign customers:', updateError.message);
    return;
  }

  console.log(`♻️ Reassigned ${ids.length} customers from barber ID ${barberId} to "Any Barber".`);
}

// 🔁 Run directly from CLI with node reassign-queue.js <barberId>
const barberId = process.argv[2];
if (!barberId) {
  console.error('Please provide a barber ID. Usage: node reassign-queue.js <barberId>');
  process.exit(1);
}

clearBarberQueue(barberId);