import supabase from './db-client.js';
import { setCors, kenyaDateISO } from './auth-helper.js';

async function bumpDailyStore(storeId, field) {
  const date = kenyaDateISO();
  const { data: existing } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('store_id', storeId)
    .eq('stat_date', date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('daily_stats')
      .update({ [field]: (existing[field] || 0) + 1 })
      .eq('id', existing.id);
  } else {
    await supabase.from('daily_stats').insert({
      store_id: storeId,
      stat_date: date,
      visitors: field === 'visitors' ? 1 : 0,
      wa_clicks: field === 'wa_clicks' ? 1 : 0,
    });
  }
}

async function bumpProductDaily(productId, storeId, field) {
  const date = kenyaDateISO();
  const { data: existing } = await supabase
    .from('product_daily_stats')
    .select('*')
    .eq('product_id', productId)
    .eq('stat_date', date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('product_daily_stats')
      .update({ [field]: (existing[field] || 0) + 1 })
      .eq('id', existing.id);
  } else {
    await supabase.from('product_daily_stats').insert({
      product_id: productId,
      store_id: storeId,
      stat_date: date,
      views: field === 'views' ? 1 : 0,
      orders: field === 'orders' ? 1 : 0,
    });
  }
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, store_id, product_id } = req.body || {};
    if (!store_id || !type) {
      return res.status(400).json({ error: 'store_id and type are required' });
    }

    if (type === 'visit') {
      const { data: store } = await supabase
        .from('stores')
        .select('id, total_visitors')
        .eq('id', store_id)
        .maybeSingle();
      if (!store) return res.status(404).json({ error: 'Store not found' });

      await supabase
        .from('stores')
        .update({ total_visitors: (store.total_visitors || 0) + 1 })
        .eq('id', store_id);
      await bumpDailyStore(store_id, 'visitors');
      return res.status(200).json({ ok: true });
    }

    if (type === 'wa_click') {
      const { data: store } = await supabase
        .from('stores')
        .select('id, total_wa_clicks')
        .eq('id', store_id)
        .maybeSingle();
      if (!store) return res.status(404).json({ error: 'Store not found' });

      await supabase
        .from('stores')
        .update({ total_wa_clicks: (store.total_wa_clicks || 0) + 1 })
        .eq('id', store_id);
      await bumpDailyStore(store_id, 'wa_clicks');

      if (product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('id, orders, store_id')
          .eq('id', product_id)
          .maybeSingle();
        if (product) {
          await supabase
            .from('products')
            .update({ orders: (product.orders || 0) + 1 })
            .eq('id', product_id);
          await bumpProductDaily(product_id, product.store_id, 'orders');
        }
      }

      return res.status(200).json({ ok: true });
    }

    if (type === 'product_view') {
      if (!product_id) return res.status(400).json({ error: 'product_id required' });
      const { data: product } = await supabase
        .from('products')
        .select('id, views, store_id')
        .eq('id', product_id)
        .maybeSingle();
      if (!product) return res.status(404).json({ error: 'Product not found' });

      await supabase
        .from('products')
        .update({ views: (product.views || 0) + 1 })
        .eq('id', product_id);
      await bumpProductDaily(product_id, product.store_id, 'views');
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown type' });
  } catch (err) {
    console.error('track error:', err);
    return res.status(500).json({ error: err.message });
  }
}
