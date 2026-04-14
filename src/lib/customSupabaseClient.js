import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekznrtfuqvazdqueimgi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrem5ydGZ1cXZhemRxdWVpbWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzYyOTQsImV4cCI6MjA2ODQ1MjI5NH0.IqKOiJ3Ci7zIA4iCRY5NXHHCa2_gmyBsXG8T239jYOI';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
