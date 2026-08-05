import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  User,
  Phone,
  Upload,
  FileJson,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { apiSend, uploadFile, storeUrl } from '../lib/api';
import { STOYANGU_LOGO } from '../lib/brand';
import Seo from '../components/Seo';

type CreatedPayload = {
  store: {
    id: number;
    name: string;
    slug: string;
  };
  credentials: {
    email: string;
    password: string;
    subdomain: string;
  };
};

export default function NewClient() {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [designJson, setDesignJson] = useState('{\n  "theme": "default",\n  "primaryColor": "#1EC8A5"\n}');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<CreatedPayload | null>(null);
  const [copied, setCopied] = useState('');

  const handleLogo = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Logo must be an image file.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const url = await uploadFile(file, 'logos');
      setLogoUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Logo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!storeName.trim() || !ownerName.trim() || !whatsapp.trim()) {
      setError('Store name, owner, and WhatsApp number are required.');
      return;
    }

    if (designJson.trim()) {
      try {
        JSON.parse(designJson);
      } catch {
        setError('Design JSON is invalid. Please paste valid JSON.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const data = await apiSend<CreatedPayload>('/api/stores', 'POST', {
        store_name: storeName.trim(),
        owner_name: ownerName.trim(),
        whatsapp: whatsapp.trim(),
        logo_url: logoUrl || null,
        design_json: designJson.trim() || '{}',
      });
      setCreated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create client');
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      /* ignore */
    }
  };

  if (created) {
    return (
      <AppShell title="Client created" subtitle="Everything is ready — share these details with the owner.">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 max-w-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{created.store.name} is live</h2>
              <p className="text-sm text-slate-400 mt-1">
                Store record, subdomain, owner login, and design JSON are all connected.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <CopyRow
              label="Store link"
              value={storeUrl(created.store.slug)}
              copied={copied === 'link'}
              onCopy={() => copyText('link', storeUrl(created.store.slug))}
            />
            <CopyRow
              label="Owner email"
              value={created.credentials.email}
              copied={copied === 'email'}
              onCopy={() => copyText('email', created.credentials.email)}
            />
            <CopyRow
              label="Owner password"
              value={created.credentials.password}
              copied={copied === 'password'}
              onCopy={() => copyText('password', created.credentials.password)}
            />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              className="btn-primary"
              onClick={() => navigate(`/my-store?storeId=${created.store.id}`)}
            >
              Open My Store portal
              <ExternalLink className="w-4 h-4" />
            </button>
            <button className="btn-ghost" onClick={() => navigate('/management')}>
              Back to management
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setCreated(null);
                setStoreName('');
                setOwnerName('');
                setWhatsapp('');
                setLogoUrl('');
                setDesignJson('{\n  "theme": "default",\n  "primaryColor": "#1EC8A5"\n}');
              }}
            >
              Add another client
            </button>
          </div>
        </motion.div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="New client"
      subtitle="One form creates the store, subdomain, owner login, and design config."
    >
      <Seo title="New client | StoYangu" description="Create a StoYangu client" path="/new-client" noindex />
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card p-5 sm:p-7 max-w-2xl space-y-5"
      >
        <div>
          <label className="label flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-teal-400" /> Store name *
          </label>
          <input
            className="input"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. Pizzaro"
            required
          />
          {storeName.trim() && (
            <p className="mt-1.5 text-xs text-slate-500">
              Subdomain preview:{' '}
              <span className="text-teal-300">
                {storeName
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')}.stoyangu.com
              </span>
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-teal-400" /> Owner name *
            </label>
            <input
              className="input"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Amina Wanjiku"
              required
            />
          </div>
          <div>
            <label className="label flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-teal-400" /> WhatsApp number *
            </label>
            <input
              className="input"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. 0712 345 678"
              required
            />
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Upload className="w-3.5 h-3.5 text-teal-400" /> Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
              ) : (
                <img src={STOYANGU_LOGO} alt="" className="w-10 h-10 object-contain opacity-70" />
              )}
            </div>
            <label className="btn-ghost cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading…' : 'Upload logo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleLogo(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <FileJson className="w-3.5 h-3.5 text-teal-400" /> Design JSON
          </label>
          <textarea
            className="input font-mono text-xs sm:text-sm min-h-[160px] resize-y"
            value={designJson}
            onChange={(e) => setDesignJson(e.target.value)}
            spellCheck={false}
            placeholder='{"theme":"default"}'
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Paste the storefront design config. It will be saved and linked to this client automatically.
          </p>
        </div>

        {error && (
          <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button type="submit" disabled={submitting || uploading} className="btn-primary">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating client…
              </>
            ) : (
              'Create client & store'
            )}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/management')}>
            Cancel
          </button>
        </div>
      </motion.form>
    </AppShell>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/8 px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
        <div className="text-sm text-white font-medium truncate">{value}</div>
      </div>
      <button onClick={onCopy} className="btn-ghost shrink-0 px-3 py-2 text-xs">
        <Copy className="w-3.5 h-3.5" />
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
