import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
    if (!config.supabaseUrl || !config.supabaseKey) {
        return null;
    }

    if (!supabaseInstance) {
        supabaseInstance = createClient(config.supabaseUrl, config.supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
            realtime: {
                // @ts-ignore
                transport: require('ws'),
            },
        });
    }

    return supabaseInstance;
}

// ============ ROOMS ============

export interface RoomRow {
    room_id: string;
    question_set: string;
    current_problem: number;
    status: string;
}

export async function saveRoom(room: RoomRow): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;
    const { error } = await supabase.from('rooms').upsert(room, { onConflict: 'room_id' });
    if (error) { console.error('saveRoom error:', error.message); return false; }
    return true;
}

export async function loadRoom(roomId: string): Promise<RoomRow | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.from('rooms').select('*').eq('room_id', roomId).single();
    if (error || !data) return null;
    return data as RoomRow;
}

export async function loadAllRooms(): Promise<RoomRow[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as RoomRow[];
}

export async function updateRoomStatus(roomId: string, status: string, currentProblem: number): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;
    const { error } = await supabase.from('rooms').update({ status, current_problem: currentProblem, updated_at: new Date().toISOString() }).eq('room_id', roomId);
    if (error) { console.error('updateRoomStatus error:', error.message); return false; }
    return true;
}

// ============ QUESTIONS ============

export interface QuestionRow {
    set_name: string;
    question_number: number;
    title: string;
    description: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: number;
}

export async function loadQuestions(setName: string): Promise<QuestionRow[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('questions').select('*').eq('set_name', setName).order('question_number', { ascending: true });
    if (error || !data) return [];
    return data as QuestionRow[];
}

export async function questionSetExists(setName: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;
    const { data, error } = await supabase.from('question_sets').select('name').eq('name', setName).single();
    return !error && !!data;
}

// ============ SCORES ============

export interface ScoreRow {
    room_id: string;
    user_id: string;
    npm: string;
    name: string;
    points: number;
}

export async function upsertScore(score: ScoreRow): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;
    const { error } = await supabase.from('scores').upsert(score, { onConflict: 'room_id,user_id' });
    if (error) { console.error('upsertScore error:', error.message); return false; }
    return true;
}

export async function loadScores(roomId: string): Promise<ScoreRow[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('scores').select('*').eq('room_id', roomId).order('points', { ascending: false });
    if (error || !data) return [];
    return data as ScoreRow[];
}

export async function loadScore(roomId: string, userId: string): Promise<ScoreRow | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.from('scores').select('*').eq('room_id', roomId).eq('user_id', userId).single();
    if (error || !data) return null;
    return data as ScoreRow;
}
