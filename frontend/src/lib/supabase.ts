import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

export interface ParticipantRow {
  id?: number;
  npm: string;
  name: string;
  date: string;
  day: string;
  start_time: string;
  duration_minutes: string;
  end_time: string;
  created_at?: string;
}

// Fetch all participants from Supabase
export async function fetchParticipants(): Promise<ParticipantRow[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
  return data ?? [];
}

// Upsert (insert or update) participants in batch
export async function saveParticipants(participants: ParticipantRow[]): Promise<{ success: boolean; error?: string }> {
  // First, delete all existing participants
  const { error: deleteError } = await supabase
    .from('participants')
    .delete()
    .neq('id', 0); // delete all rows

  if (deleteError) {
    console.error('Error clearing participants:', deleteError);
    return { success: false, error: deleteError.message };
  }

  // Then insert the new data (only rows with npm filled)
  const rowsToInsert = participants
    .filter(p => p.npm.trim() !== '')
    .map(p => ({
      npm: p.npm,
      name: p.name,
      date: p.date,
      day: p.day,
      start_time: p.start_time,
      duration_minutes: p.duration_minutes,
      end_time: p.end_time,
    }));

  if (rowsToInsert.length === 0) {
    return { success: true };
  }

  const { error: insertError } = await supabase
    .from('participants')
    .insert(rowsToInsert);

  if (insertError) {
    console.error('Error saving participants:', insertError);
    return { success: false, error: insertError.message };
  }

  return { success: true };
}

// Delete a single participant by id
export async function deleteParticipant(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting participant:', error);
    return false;
  }
  return true;
}
