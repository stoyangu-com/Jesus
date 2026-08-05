import supabase from '../lib/db-client.js';
import { setCors } from '../lib/auth-helper.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { slug, id } = req.query || {};

    // Single public storefront
    if (slug || id) {
      let query = supabase
        .from('stores')
        .select('id, name, slug, owner_name, whatsapp, logo_url, design_json, total_visitors, is_active, created_at')
        .eq('is_active', true);

      if (id) query = query.eq('id', Number(id));
      else query = query.eq('slug', String(slug).toLowerCase());

      const { data: store, error } = await query.maybeSingle();
      if (error) throw error;
      if (!store) return res.status(404).json({ error: 'Store not found' });

      const { data: products, error: pErr } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, views, orders')
        .eq('store_id', store.id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });
      if (pErr) throw pErr;

      return res.status(200).json({
        store: {
          ...store,
          public_url: `https://${store.slug}.stoyangu.com`,
          path_url: `https://stoyangu.com/s/${store.slug}`,
        },
        products: products || [],
      });
    }

    // Directory listing
    const { data: stores, error } = await supabase
      .from('stores')
      .select('id, name, slug, owner_name, logo_url, total_visitors, created_at')
      .eq('is_active', true)
      .order('total_visitors', { ascending: false });
    if (error) throw error;

    const list = (stores || []).map((s) => ({
      ...s,
      public_url: `https://${s.slug}.stoyangu.com`,
      path_url: `https://stoyangu.com/s/${s.slug}`,
    }));

    return res.status(200).json({ stores: list, count: list.length });
  } catch (err) {
    console.error('public-stores error:', err);
    return res.status(500).json({ error: err.message });
  }
}
