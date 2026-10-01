import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MissingPerson {
  id: string;
  case_number: string;
  name: string;
  age: number;
  gender: string;
  description?: string;
  last_seen_location: string;
  last_seen_date: string;
  photo_url?: string;
  descriptor?: number[];
  status: string;
  contact_info?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Sighting {
  id: string;
  missing_person_id: string;
  image_url?: string;
  confidence_score: number;
  location?: string;
  sighting_date: string;
  status: string;
  bbox?: number[];
  notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  missing_persons?: MissingPerson;
}
