import supabase from './_lib/db-client.js';
import { setCors, requireUser } from './_lib/auth-helper.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const auth = await requireUser(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    let profile = auth.profile;

    // Auto-heal founder profile if missing
    if (!profile) {
      const email = auth.user.email || '';
      const isFounder = email === 'founder@stoyangu.com' || email.endsWith('@stoyangu.admin');
      const { data: created, error } = await supabase
        .from('profiles')
        .upsert({
          id: auth.user.id,
          email,
          full_name: auth.user.user_metadata?.full_name || (isFounder ? 'Founder' : 'Owner'),
          role: isFounder ? 'founder' : 'owner',
          store_id: null,
        })
        .select()
        .single();
      if (error) throw error;
      profile = created;
    }

    let store = null;
    if (profile.store_id) {
      const { data } = await supabase
        .from('stores')
        .select('*')
        .eq('id', profile.store_id)
        .maybeSingle();
      store = data;
    }

    return res.status(200).json({ user: auth.user, profile, store });
  } catch (err) {
    console.error('profile error:', err);
    return res.status(500).json({ error: err.message });
  }
}
