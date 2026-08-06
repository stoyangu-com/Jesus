import { createClient } from '@supabase/supabase-js';
import { triggerRestore } from './db-wake.js';

const urlKeys = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL', 'VITE_SUPABASE_URL'];
const roleKeys = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_ROLE_KEY'];

// --- Conflict Detection ---
const foundUrls = urlKeys.filter(k => process.env[k]).map(k => ({ key: k, val: process.env[k] }));
const foundRoles = roleKeys.filter(k => process.env[k]).map(k => ({ key: k, val: process.env[k] }));

const urlConflict = foundUrls.length > 1 && foundUrls.some(u => u.val !== foundUrls[0].val);
const roleConflict = foundRoles.length > 1 && foundRoles.some(r => r.val !== foundRoles[0].val);

if (urlConflict || roleConflict) {
  console.error(`\x1b[31m[DB-CLIENT] CRITICAL CONFIG CONFLICT DETECTED!\x1b[0m`);
  if (urlConflict) console.error(`[DB-CLIENT] Multiple different Supabase URLs found:`, foundUrls);
  if (roleConflict) console.error(`[DB-CLIENT] Multiple different Role Keys found:`, foundRoles);
  console.error(`\x1b[33mThis usually causes "Unregistered" errors during login. Please remove redundant keys in Vercel and redeploy.\x1b[0m`);
}

const selectedUrlKey = urlKeys.find(key => process.env[key]);
const selectedRoleKey = roleKeys.find(key => process.env[key]);

const urlVal = process.env[selectedUrlKey] || '';
const roleVal = process.env[selectedRoleKey] || '';

console.log(`[DB-CLIENT] Using URL from: ${selectedUrlKey || 'NONE'} (${urlVal.slice(0, 15)}...)`);
console.log(`[DB-CLIENT] Using Role Key from: ${selectedRoleKey || 'NONE'} (${roleVal ? roleVal.slice(0, 6) + '...' : 'EMPTY'})`);

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
