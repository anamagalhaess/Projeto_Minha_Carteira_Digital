import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rumegwdvtrocqejogbvp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1bWVnd2R2dHJvY3Flam9nYnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjI5NjYsImV4cCI6MjA5NzE5ODk2Nn0.jioLTbS1t-0tExHbeVBZlUI9C1v3zcIe1eOZ9P8mU5Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetch.bind(globalThis),
  },
});