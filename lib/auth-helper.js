import supabase, { getSupabaseEnvStatus } from './db-client.js';

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function extractBearer(req) {
  const raw =
    req.headers.authorization ||
    req.headers.Authorization ||
    req.headers['authorization'] ||
    '';
  if (!raw) return '';
  return String(raw).replace(/^Bearer\s+/i, '').trim();
}

export async function requireUser(req) {
  const env = getSupabaseEnvStatus();

  // Diagnostic logging to find the "Ghost Key"
  const activeRoleKeyName = env.details?.roleKey || 'UNKNOWN';
  const activeRoleKeyValue = process.env[activeRoleKeyName] || '';
  const keySnippet = activeRoleKeyValue ? activeRoleKeyValue.slice(0, 6) + '...' : 'EMPTY';

  console.log(`[requireUser] DEBUG: Verifying user using key: ${activeRoleKeyName} (Starts with: ${keySnippet})`);

  if (!env.hasUrl || !env.hasServiceRole) {
    return {
      error:
        'Server misconfigured: missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY on Vercel. Add both, then Redeploy.',
      status: 500,
      code: 'MISSING_ENV',
    };
  }

  const token = extractBearer(req);
  if (!token) {
    return { error: 'Unauthorized — no login token sent', status: 401, code: 'NO_TOKEN' };
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    console.error('[requireUser] getUser failed:', error?.message || 'no user', {
      tokenSnippet: token.slice(0, 10) + '...',
      usedKey: activeRoleKeyName,
      keySnippet: keySnippet
    });
    return {
      error:
        error?.message ||
        'Invalid or expired login token. Sign out and sign in again. If it keeps failing, your Vercel service_role key may not match this Supabase project.',
      status: 401,
      code: 'INVALID_TOKEN',
      detail: error?.message || null,
    };
  }

  const user = data.user;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[requireUser] profile read failed:', profileError.message);
  }

  return { user, profile: profile || null };
}

export function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'store';
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function kenyaDateISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
}
