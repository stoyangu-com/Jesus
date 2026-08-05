import supabase from './db-client.js';
import { setCors } from './auth-helper.js';

function escapeXml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const site = process.env.PUBLIC_SITE_URL || 'https://stoyangu.com';
    const today = new Date().toISOString().slice(0, 10);

    const staticUrls = [
      { loc: `${site}/`, priority: '1.0', changefreq: 'weekly' },
      { loc: `${site}/about`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${site}/stores`, priority: '0.9', changefreq: 'daily' },
    ];

    const { data: stores } = await supabase
      .from('stores')
      .select('slug, created_at')
      .eq('is_active', true);

    const storeUrls = (stores || []).map((s) => ({
      loc: `${site}/s/${s.slug}`,
      lastmod: (s.created_at || today).toString().slice(0, 10),
      priority: '0.8',
      changefreq: 'daily',
    }));

    const all = [...staticUrls, ...storeUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(u.lastmod || today)}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('sitemap error:', err);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://stoyangu.com/</loc><priority>1.0</priority></url>
</urlset>`);
  }
}
