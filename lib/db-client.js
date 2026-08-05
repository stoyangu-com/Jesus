import { createClient } from '@supabase/supabase-js';
import { triggerRestore } from './db-wake.js';

const urlKeys = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL', 'VITE_SUPABASE_URL'];
const roleKeys = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_ROLE_KEY'];

const selectedUrlKey = urlKeys.find(key => process.env[key]);
const selectedRoleKey = roleKeys.find(key => process.env[key]);

console.log(`[DB-CLIENT] Using URL from: ${selectedUrlKey || 'NONE'}`);
console.log(`[DB-CLIENT] Using Role Key from: ${selectedRoleKey || 'NONE'}`);

const supabase = createClient(
  process.env[selectedUrlKey] || '',
  process.env[selectedRoleKey] || '',
  {
    global: {
      fetch: async (url, options) => {
        const res = await fetch(url, options);
        if (!res.ok && res.status >= 500) triggerRestore();
        return res;
      },
    },
  }
);

export default supabase;

export function getSupabaseEnvStatus() {
  return {
    hasUrl: !!selectedUrlKey,
    hasServiceRole: !!selectedRoleKey,
    details: {
      urlKey: selectedUrlKey,
      roleKey: selectedRoleKey
    }
  };
}
