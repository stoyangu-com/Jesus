import supabase from './_lib/db-client.js';
import { setCors, requireUser } from './_lib/auth-helper.js';

async function canAccessStore(auth, storeId) {
  if (auth.profile?.role === 'founder') return true;
  if (auth.profile?.store_id === Number(storeId)) return true;

  const { data: store } = await supabase
    .from('stores')
    .select('user_id')
    .eq('id', storeId)
    .maybeSingle();

  return store?.user_id === auth.user.id;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const auth = await requireUser(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    if (req.method === 'GET') {
      const storeId = Number(req.query?.store_id);
      if (!storeId) return res.status(400).json({ error: 'store_id is required' });

      const allowed = await canAccessStore(auth, storeId);
      if (!allowed) return res.status(403).json({ error: 'Access denied' });

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { store_id, name, description, price, image_url } = req.body || {};
      if (!store_id || !name?.trim()) {
        return res.status(400).json({ error: 'store_id and name are required' });
      }

      const allowed = await canAccessStore(auth, store_id);
      if (!allowed) return res.status(403).json({ error: 'Access denied' });

      const numericPrice = price === '' || price === null || price === undefined ? 0 : Number(price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ error: 'Price must be a valid number' });
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          store_id: Number(store_id),
          name: name.trim(),
          description: (description || '').trim(),
          price: numericPrice,
          image_url: image_url || null,
          is_hidden: false,
          views: 0,
          orders: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, name, description, price, image_url, is_hidden } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Product id is required' });

      const { data: existing, error: findError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (findError) throw findError;
      if (!existing) return res.status(404).json({ error: 'Product not found' });

      const allowed = await canAccessStore(auth, existing.store_id);
      if (!allowed) return res.status(403).json({ error: 'Access denied' });

      const updates = {};
      if (name !== undefined) updates.name = String(name).trim();
      if (description !== undefined) updates.description = String(description || '').trim();
      if (price !== undefined) {
        const numericPrice = price === '' || price === null ? 0 : Number(price);
        if (Number.isNaN(numericPrice) || numericPrice < 0) {
          return res.status(400).json({ error: 'Price must be a valid number' });
        }
        updates.price = numericPrice;
      }
      if (image_url !== undefined) updates.image_url = image_url;
      if (typeof is_hidden === 'boolean') updates.is_hidden = is_hidden;

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Product id is required' });

      const { data: existing, error: findError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (findError) throw findError;
      if (!existing) return res.status(404).json({ error: 'Product not found' });

      const allowed = await canAccessStore(auth, existing.store_id);
      if (!allowed) return res.status(403).json({ error: 'Access denied' });

      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      await supabase.from('product_daily_stats').delete().eq('product_id', id);

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('products error:', err);
    return res.status(500).json({ error: err.message });
  }
}
