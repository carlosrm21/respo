import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\\r\\n/g, '')?.replace(/\\r/g, '')?.trim();
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\\r\\n/g, '')?.replace(/\\r/g, '')?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in .env.vercel');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase Connection to:', supabaseUrl);
  
  try {
    const { data, error } = await supabase
      .from('restaurantes')
      .select('id, nombre, nit, activo')
      .limit(3);
      
    if (error) {
      console.error('Supabase Query Error (restaurantes):', error.message);
      process.exit(1);
    }
    
    console.log('✅ Connection Successful!');
    console.log(`Found ${data.length} restaurant(s):`);
    console.log(data);
    
    const { data: meseros, error: meserosError } = await supabase
      .from('meseros')
      .select('id, nombre, rol, activo, restaurante_id')
      .limit(3);
      
    if (meserosError) {
      console.error('Error fetching meseros:', meserosError.message);
    } else {
      console.log(`\nFound ${meseros.length} users (meseros):`);
      console.log(meseros);
    }

  } catch (err) {
    console.error('Unexpected Error:', err);
  }
}

testConnection();
