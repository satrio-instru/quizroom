import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jsnjwzvzjfkmzcjdvdsc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzbmp3enZ6amZrbXpjamR2ZHNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU0NDU3MCwiZXhwIjoyMDk4MTIwNTcwfQ.n8jOFrvx9QgXHwlswUtwru3lu0pKTrDevOl2gD87x_c'
);

const ROOM_ID = process.argv[2] || 'UAP-PTI-2025';

async function main() {
  console.log(`Resetting room: ${ROOM_ID}`);

  // 1. Save current scores to accumulated_scores before deleting
  const { data: currentScores } = await supabase
    .from('scores')
    .select('*')
    .eq('room_id', ROOM_ID);

  if (currentScores && currentScores.length > 0) {
    // Create accumulated_scores table if not exists (via direct insert)
    for (const score of currentScores) {
      await supabase.from('accumulated_scores').upsert({
        room_id: score.room_id,
        npm: score.npm,
        name: score.name,
        total_points: score.points,
        attempts: 1,
        last_attempt_at: new Date().toISOString(),
      }, { onConflict: 'room_id,npm' });
    }
    console.log(`Archived ${currentScores.length} scores to accumulated_scores`);
  }

  // 2. Delete current scores
  await supabase.from('scores').delete().eq('room_id', ROOM_ID);
  console.log('Current scores deleted');

  // 3. Reset room status
  await supabase.from('rooms').update({
    status: 'not_started',
    current_problem: 0,
    updated_at: new Date().toISOString(),
  }).eq('room_id', ROOM_ID);
  console.log('Room status reset to not_started');

  console.log(`\n✅ Room "${ROOM_ID}" has been reset!`);
  console.log('Participants can now rejoin and take the quiz again.');
}

main().catch(console.error);
