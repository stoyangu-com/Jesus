import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Store, ExternalLink } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import Seo from '../components/Seo';
import LoadingScreen from '../components/LoadingScreen';
import { STOYANGU_LOGO } from '../lib/brand';

type PublicStore = {
  id: number;
  name: string;
  slug: string;
  owner_name: string;
  logo_url: string | null;
  total_visitors: number;
  path_url: string;
  public_url: string;
};

export default function StoresDirectory() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [q, setQ] = useState(params.get('q') || '');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/public-stores');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load stores');
        setStores(data.stores || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load stores');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return stores;
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(needle) ||
        s.slug.toLowerCase().includes(needle) ||
        (s.owner_name || '').toLowerCase().includes(needle)
    );
  }, [stores, q]);

  if (loading) return <LoadingScreen label="Loading stores…" />;

  return (
    <PublicLayout>
      <Seo
        title="Browse StoYangu stores in Kenya"
        description="Browse StoYangu online stores across Kenya. See products and order on WhatsApp."
        path={q ? `/stores?q=${encodeURIComponent(q)}` : '/stores'}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'StoYangu Stores',
          url: 'https://stoyangu.com/stores',
          description: 'Directory of active StoYangu online stores in Kenya.',
          numberOfItems: stores.length,
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-semibold text-white tracking-tight">Stores on StoYangu</h1>
          <p className="mt-2 text-slate-400">
            Open a store, see products, and order on WhatsApp.
          </p>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input pl-10"
            placeholder="Search by store name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="glass-card p-10 text-center text-slate-400">
            <Store className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No stores match that search yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((store) => (
              <Link
                key={store.id}
                to={`/s/${store.slug}`}
                className="glass-card p-5 hover:border-teal-400/30 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-navy-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={store.logo_url || STOYANGU_LOGO}
                      alt=""
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-white truncate group-hover:text-teal-300">
                      {store.name}
                    </h2>
                    <p className="text-xs text-slate-500 truncate">{store.slug}.stoyangu.com</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate pr-2">{store.owner_name}</span>
                  <span className="inline-flex items-center gap-1 text-teal-300 shrink-0">
                    View store <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
