import supabase from './db-client.js';
import { setCors, kenyaDateISO } from './auth-helper.js';

function formatKES(n) {
  return `KES ${Number(n || 0).toLocaleString('en-KE')}`;
}

function buildMessage({ store, visitors, waClicks, winner, needLook }) {
  const subdomain = `${store.slug}.stoyangu.com`;
  const lines = [
    `Habari ${store.owner_name}! 👋`,
    `Here's your StoYangu daily report for *${store.name}*:`,
    '',
    `👀 Website visits today: *${visitors}*`,
    `💬 WhatsApp order clicks today: *${waClicks}*`,
    '',
  ];

  if (winner) {
    lines.push(`🏆 *Daily Winner*: ${winner.name}`);
    lines.push(`   ${winner.orders} order click${winner.orders === 1 ? '' : 's'} · ${winner.views} view${winner.views === 1 ? '' : 's'}`);
    lines.push('');
  } else {
    lines.push('🏆 *Daily Winner*: No product stood out yet — keep sharing your store link!');
    lines.push('');
  }

  if (needLook) {
    lines.push(`🔍 *Need a Look*: ${needLook.name}`);
    lines.push(`   ${needLook.views} view${needLook.views === 1 ? '' : 's'} but only ${needLook.orders} order click${needLook.orders === 1 ? '' : 's'}.`);
    lines.push(`   💡 Tip: ${needLook.advice}`);
    lines.push('');
  }

  lines.push(`📌 Gentle reminder: mention *${subdomain}* at the end of all your videos so more customers can find & order all your products in one place.`);
  lines.push('');
  lines.push('— Team StoYangu');

  return lines.join('\n');
}

function pickAdvice(product) {
  const tips = [
    'Try a clearer product photo with good lighting — customers buy with their eyes first.',
    'Double-check the price feels fair for your market, or highlight a small bundle deal.',
    'Add a short, friendly description that answers “why should I order this today?”',
    'Feature this product in your next WhatsApp status or short video with your store link.',
  ];
  if (!product.image_url) {
    return 'Add an attractive product photo — items without images almost never convert.';
  }
  if (Number(product.price) <= 0) {
    return 'Set a clear price so customers know exactly what to expect before messaging you.';
  }
  return tips[product.id % tips.length];
}

async function sendTelnyxWhatsApp(to, text) {
  const apiKey = process.env.TELNYX_API_KEY;
  const from = process.env.TELNYX_WHATSAPP_FROM;
  const messagingProfileId = process.env.TELNYX_MESSAGING_PROFILE_ID;

  if (!apiKey || !from) {
    return {
      ok: false,
      skipped: true,
      error: 'Telnyx is not configured. Add TELNYX_API_KEY and TELNYX_WHATSAPP_FROM in Secrets.',
    };
  }

  let destination = String(to || '').replace(/\s+/g, '');
  if (destination.startsWith('0')) {
    destination = `+254${destination.slice(1)}`;
  } else if (destination.startsWith('254')) {
    destination = `+${destination}`;
  } else if (!destination.startsWith('+')) {
    destination = `+${destination}`;
  }

  const body = {
    from,
    to: destination,
    text,
    type: 'SMS',
  };

  // Prefer WhatsApp when messaging profile is set (Telnyx WhatsApp Business)
  if (messagingProfileId) {
    body.messaging_profile_id = messagingProfileId;
    body.type = 'whatsapp';
  }

  const response = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      error: payload?.errors?.[0]?.detail || payload?.error || `Telnyx error ${response.status}`,
      payload,
    };
  }

  return { ok: true, payload };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization || '';
    const querySecret = req.query?.secret;
    const provided =
      authHeader.replace('Bearer ', '') ||
      querySecret ||
      req.headers['x-cron-secret'];

    // Allow Vercel Cron (no secret) in production, or explicit secret, or founder token
    const isVercelCron = Boolean(req.headers['x-vercel-cron']);
    const secretOk = cronSecret ? provided === cronSecret : true;

    if (!isVercelCron && !secretOk) {
      // Also allow authenticated founder
      const token = authHeader.replace('Bearer ', '');
      if (token && token !== cronSecret) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          if (profile?.role !== 'founder') {
            return res.status(401).json({ error: 'Unauthorized' });
          }
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      } else if (!secretOk) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const reportDate = req.query?.date || req.body?.date || kenyaDateISO();
    const dryRun = req.query?.dry_run === '1' || req.body?.dry_run === true;

    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .eq('is_active', true);
    if (storesError) throw storesError;

    const results = [];

    for (const store of stores || []) {
      const { data: dayStat } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('store_id', store.id)
        .eq('stat_date', reportDate)
        .maybeSingle();

      const visitors = dayStat?.visitors || 0;
      const waClicks = dayStat?.wa_clicks || 0;

      const { data: productStats } = await supabase
        .from('product_daily_stats')
        .select('*, products(*)')
        .eq('store_id', store.id)
        .eq('stat_date', reportDate);

      const enriched = (productStats || [])
        .map((row) => ({
          id: row.product_id,
          name: row.products?.name || 'Product',
          image_url: row.products?.image_url,
          price: row.products?.price,
          views: row.views || 0,
          orders: row.orders || 0,
        }))
        .filter((p) => p.name);

      let winner = null;
      const ordered = [...enriched].sort((a, b) => b.orders - a.orders || b.views - a.views);
      if (ordered[0] && ordered[0].orders > 0) {
        winner = ordered[0];
      }

      let needLook = null;
      const candidates = enriched
        .filter((p) => p.views > 0 && p.orders === 0)
        .sort((a, b) => b.views - a.views);
      if (candidates[0]) {
        needLook = { ...candidates[0], advice: pickAdvice(candidates[0]) };
      } else {
        const low = enriched
          .filter((p) => p.views >= 3 && p.orders > 0 && p.orders / p.views < 0.1)
          .sort((a, b) => b.views - a.views);
        if (low[0]) needLook = { ...low[0], advice: pickAdvice(low[0]) };
      }

      const message = buildMessage({ store, visitors, waClicks, winner, needLook });

      let sendResult = { ok: true, skipped: true, reason: 'dry_run' };
      if (!dryRun) {
        sendResult = await sendTelnyxWhatsApp(store.whatsapp, message);
      }

      // Log the report
      await supabase.from('report_logs').insert({
        store_id: store.id,
        report_date: reportDate,
        message,
        status: sendResult.ok ? (sendResult.skipped ? 'skipped' : 'sent') : 'failed',
        error: sendResult.error || null,
      });

      results.push({
        store_id: store.id,
        store_name: store.name,
        whatsapp: store.whatsapp,
        visitors,
        wa_clicks: waClicks,
        winner: winner?.name || null,
        need_look: needLook?.name || null,
        send: sendResult,
        preview: message,
      });
    }

    return res.status(200).json({
      ok: true,
      report_date: reportDate,
      dry_run: dryRun,
      sent: results.filter((r) => r.send.ok && !r.send.skipped).length,
      results,
    });
  } catch (err) {
    console.error('daily-report error:', err);
    return res.status(500).json({ error: err.message });
  }
}
