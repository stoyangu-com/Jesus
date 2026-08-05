import supabase from './_lib/db-client.js';
import { setCors, requireUser, kenyaDateISO } from './_lib/auth-helper.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const auth = await requireUser(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });
    if (!auth.profile || auth.profile.role !== 'founder') {
      return res.status(403).json({ error: 'Founder access only' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });
    if (storesError) throw storesError;

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, store_id, is_hidden');
    if (productsError) throw productsError;

    const today = kenyaDateISO();
    const { data: todayStats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('stat_date', today);

    const totalStores = stores?.length || 0;
    const activeStores = stores?.filter((s) => s.is_active).length || 0;
    const totalVisitors = (stores || []).reduce((sum, s) => sum + (s.total_visitors || 0), 0);
    const totalWaClicks = (stores || []).reduce((sum, s) => sum + (s.total_wa_clicks || 0), 0);
    const totalProducts = products?.length || 0;
    const visibleProducts = products?.filter((p) => !p.is_hidden).length || 0;
    const todayVisitors = (todayStats || []).reduce((sum, s) => sum + (s.visitors || 0), 0);
    const todayWaClicks = (todayStats || []).reduce((sum, s) => sum + (s.wa_clicks || 0), 0);

    const storesWithMeta = (stores || []).map((store) => {
      const day = (todayStats || []).find((d) => d.store_id === store.id);
      const productCount = (products || []).filter((p) => p.store_id === store.id).length;
      return {
        ...store,
        product_count: productCount,
        today_visitors: day?.visitors || 0,
        today_wa_clicks: day?.wa_clicks || 0,
      };
    });

    return res.status(200).json({
      overview: {
        totalStores,
        activeStores,
        totalVisitors,
        totalWaClicks,
        totalProducts,
        visibleProducts,
        todayVisitors,
        todayWaClicks,
        conversionRate: totalVisitors > 0 ? Number(((totalWaClicks / totalVisitors) * 100).toFixed(1)) : 0,
      },
      stores: storesWithMeta,
    });
  } catch (err) {
    console.error('analytics error:', err);
    return res.status(500).json({ error: err.message });
  }
}
