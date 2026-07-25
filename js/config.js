const SUPABASE_URL = "https://zluditwbdmwmyueqezbr.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdWRpdHdiZG13bXl1ZXFlemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzI4MTMsImV4cCI6MjEwMDQ0ODgxM30.W9ea2iP_Vrsb_ecB2ygPwLLN0TPJQejUmIKCKNgIpec";



const { createClient } = window.supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log(supabaseClient);