import { createClient } from '@supabase/supabase-js';

export interface VisitorRecord {
  id: string;
  name: string;
  normalized_name: string;
  created_at: string;
  sent: boolean;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase = supabaseUrl && supabasePublicKey
  ? createClient(supabaseUrl, supabasePublicKey)
  : null;

export async function fetchVisitors(): Promise<VisitorRecord[]> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('visitors')
    .select('id, name, normalized_name, created_at, sent')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as VisitorRecord[];
}
