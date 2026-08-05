import supabase from './_lib/db-client.js';
import { setCors, requireUser } from './_lib/auth-helper.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { full_name, phone, willing_video } = req.body || {};

      if (!full_name?.trim() || !phone?.trim()) {
        return res.status(400).json({ error: 'Please enter your name and phone number.' });
      }

      const cleanPhone = String(phone).trim();
      if (cleanPhone.replace(/\D/g, '').length < 9) {
        return res.status(400).json({ error: 'Please enter a valid phone number.' });
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
          full_name: full_name.trim(),
          phone: cleanPhone,
          willing_video: Boolean(willing_video),
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({
        ok: true,
        message:
          'Asante! We got your application. We will message you on WhatsApp if you are approved.',
        application: { id: data.id },
      });
    }

    if (req.method === 'GET') {
      const auth = await requireUser(req);
      if (auth.error) return res.status(auth.status).json({ error: auth.error });
      if (auth.profile?.role !== 'founder') {
        return res.status(403).json({ error: 'Founder access only' });
      }

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'PUT') {
      const auth = await requireUser(req);
      if (auth.error) return res.status(auth.status).json({ error: auth.error });
      if (auth.profile?.role !== 'founder') {
        return res.status(403).json({ error: 'Founder access only' });
      }

      const { id, status, notes } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });

      const updates = {};
      if (status) updates.status = status;
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('applications error:', err);
    return res.status(500).json({ error: err.message });
  }
}
