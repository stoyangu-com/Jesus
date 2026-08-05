import supabase from '../lib/db-client.js';
import { setCors, requireUser, slugify } from '../lib/auth-helper.js';

function generatePassword(slug, whatsapp) {
  const digits = String(whatsapp || '').replace(/\D/g, '').slice(-4) || '2024';
  const clean = (slug || 'store').replace(/-/g, '').slice(0, 8);
  return `Sy${clean}${digits}!`;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const auth = await requireUser(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    if (req.method === 'GET') {
      const { id, slug } = req.query || {};

      if (id || slug) {
        let query = supabase.from('stores').select('*');
        if (id) query = query.eq('id', Number(id));
        else query = query.eq('slug', slug);

        const { data: store, error } = await query.maybeSingle();
        if (error) throw error;
        if (!store) return res.status(404).json({ error: 'Store not found' });

        const isFounder = auth.profile?.role === 'founder';
        const isOwner = auth.profile?.store_id === store.id || auth.user.id === store.user_id;
        if (!isFounder && !isOwner) {
          return res.status(403).json({ error: 'Access denied' });
        }

        return res.status(200).json(store);
      }

      if (auth.profile?.role !== 'founder') {
        return res.status(403).json({ error: 'Founder access only' });
      }

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      if (auth.profile?.role !== 'founder') {
        return res.status(403).json({ error: 'Founder access only' });
      }

      const { store_name, owner_name, whatsapp, logo_url, design_json } = req.body || {};

      if (!store_name?.trim() || !owner_name?.trim() || !whatsapp?.trim()) {
        return res.status(400).json({ error: 'Store name, owner name, and WhatsApp are required' });
      }

      let baseSlug = slugify(store_name);
      let slug = baseSlug;
      let attempt = 1;

      while (attempt < 20) {
        const { data: existing } = await supabase
          .from('stores')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        if (!existing) break;
        attempt += 1;
        slug = `${baseSlug}-${attempt}`;
      }

      const ownerEmail = `${slug}@owners.stoyangu.com`;
      const ownerPassword = generatePassword(slug, whatsapp);

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: ownerEmail,
        password: ownerPassword,
        email_confirm: true,
        user_metadata: {
          full_name: owner_name.trim(),
          role: 'owner',
        },
      });

      if (authError) {
        if (authError.message?.includes('already been registered')) {
          return res.status(400).json({ error: 'A store with a similar name already has an owner account. Try a different store name.' });
        }
        throw authError;
      }

      let parsedJson = design_json;
      if (typeof design_json === 'string' && design_json.trim()) {
        try {
          parsedJson = JSON.parse(design_json);
        } catch {
          return res.status(400).json({ error: 'Design JSON is not valid. Please paste valid JSON.' });
        }
      } else if (!design_json) {
        parsedJson = {};
      }

      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert({
          name: store_name.trim(),
          slug,
          owner_name: owner_name.trim(),
          whatsapp: whatsapp.trim(),
          logo_url: logo_url || null,
          design_json: parsedJson || {},
          user_id: authUser.user.id,
          total_visitors: 0,
          total_wa_clicks: 0,
          is_active: true,
        })
        .select()
        .single();

      if (storeError) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
        throw storeError;
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authUser.user.id,
        email: ownerEmail,
        full_name: owner_name.trim(),
        role: 'owner',
        store_id: store.id,
      });

      if (profileError) throw profileError;

      return res.status(201).json({
        store,
        credentials: {
          email: ownerEmail,
          password: ownerPassword,
          subdomain: `${slug}.stoyangu.com`,
        },
      });
    }

    if (req.method === 'PUT') {
      if (auth.profile?.role !== 'founder') {
        return res.status(403).json({ error: 'Founder access only' });
      }

      const { id, is_active, name, owner_name, whatsapp, logo_url, design_json } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Store id required' });

      const updates = {};
      if (typeof is_active === 'boolean') updates.is_active = is_active;
      if (name) updates.name = name;
      if (owner_name) updates.owner_name = owner_name;
      if (whatsapp) updates.whatsapp = whatsapp;
      if (logo_url !== undefined) updates.logo_url = logo_url;
      if (design_json !== undefined) updates.design_json = design_json;

      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('stores error:', err);
    return res.status(500).json({ error: err.message });
  }
}
