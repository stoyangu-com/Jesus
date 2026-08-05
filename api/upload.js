import supabase from './db-client.js';
import { setCors, requireUser } from './auth-helper.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const auth = await requireUser(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    const { fileName, fileBase64, contentType, folder } = req.body || {};
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'fileName and fileBase64 are required' });
    }

    const safeName = String(fileName)
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 80);
    const prefix = folder ? String(folder).replace(/[^a-zA-Z0-9_-]/g, '') : 'uploads';
    const path = `${prefix}/${Date.now()}-${safeName}`;

    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Max 5MB.' });
    }

    const { error } = await supabase.storage
      .from('stoyangu-assets')
      .upload(path, buffer, {
        contentType: contentType || 'image/png',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('stoyangu-assets')
      .getPublicUrl(path);

    return res.status(200).json({ url: urlData.publicUrl, path });
  } catch (err) {
    console.error('upload error:', err);
    return res.status(500).json({ error: err.message });
  }
}
