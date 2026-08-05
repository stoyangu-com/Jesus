import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  MessageCircle,
  Plus,
  Pencil,
  EyeOff,
  Trash2,
  ExternalLink,
  Copy,
  ArrowLeft,
  Package,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import LoadingScreen from '../components/LoadingScreen';
import ProductModal, { type ProductForm } from '../components/ProductModal';
import { apiGet, apiSend, formatNumber, formatPrice, storeUrl } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { STOYANGU_LOGO } from '../lib/brand';
import Seo from '../components/Seo';

type Product = {
  id: number;
  store_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_hidden: boolean;
  views: number;
  orders: number;
};

type Store = {
  id: number;
  name: string;
  slug: string;
  owner_name: string;
  logo_url: string | null;
  total_visitors: number;
  total_wa_clicks: number;
};

export default function MyStore() {
  const { profile, store: myStore } = useAuth();
  const [params] = useSearchParams();
  const storeIdParam = params.get('storeId');
  const isFounderView = profile?.role === 'founder' && Boolean(storeIdParam);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');

  const targetStoreId = useMemo(() => {
    if (storeIdParam) return Number(storeIdParam);
    if (myStore?.id) return myStore.id;
    if (profile?.store_id) return profile.store_id;
    return null;
  }, [storeIdParam, myStore, profile]);

  const load = useCallback(async () => {
    if (!targetStoreId) {
      setLoading(false);
      setError('No store is linked to this account yet.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [storeData, productData] = await Promise.all([
        apiGet<Store>(`/api/stores?id=${targetStoreId}`),
        apiGet<Product[]>(`/api/products?store_id=${targetStoreId}`),
      ]);
      setStore(storeData);
      setProducts(productData || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load store');
    } finally {
      setLoading(false);
    }
  }, [targetStoreId]);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: String(p.price ?? ''),
      image_url: p.image_url || '',
    });
    setModalOpen(true);
  };

  const saveProduct = async (form: ProductForm) => {
    if (!store) return;
    if (form.id) {
      await apiSend('/api/products', 'PUT', {
        id: form.id,
        name: form.name,
        description: form.description,
        price: form.price,
        image_url: form.image_url || null,
      });
      showToast('Product updated');
    } else {
      await apiSend('/api/products', 'POST', {
        store_id: store.id,
        name: form.name,
        description: form.description,
        price: form.price,
        image_url: form.image_url || null,
      });
      showToast('Product added');
    }
    await load();
  };

  const toggleHide = async (p: Product) => {
    setBusyId(p.id);
    try {
      await apiSend('/api/products', 'PUT', { id: p.id, is_hidden: !p.is_hidden });
      showToast(p.is_hidden ? 'Product is visible again' : 'Product hidden from storefront');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      await apiSend('/api/products', 'DELETE', { id: p.id });
      showToast('Product deleted');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const copyLink = async () => {
    if (!store) return;
    try {
      await navigator.clipboard.writeText(storeUrl(store.slug));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (loading) return <LoadingScreen label="Opening your store…" />;

  if (!store) {
    return (
      <AppShell title="My Store">
        <div className="glass-card p-8 text-center text-slate-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{error || 'Store not found.'}</p>
          {profile?.role === 'founder' && (
            <Link to="/management" className="btn-primary mt-4 inline-flex">
              Back to management
            </Link>
          )}
        </div>
      </AppShell>
    );
  }

  const link = storeUrl(store.slug);

  return (
    <AppShell>
      <Seo
        title="My Store | StoYangu"
        description="Manage your StoYangu store products and stats."
        path="/my-store"
        noindex
      />

      {isFounderView && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <span>
            Viewing as client portal for <strong>{store.name}</strong>
          </span>
          <Link to="/management" className="inline-flex items-center gap-1 text-amber-200 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Management
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-teal-500 text-navy-950 text-sm font-medium shadow-lg shadow-teal-900/40">
          {toast}
        </div>
      )}

      {/* Hero — dark brand style */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy-900 via-navy-900 to-teal-950/40 p-6 sm:p-10 mb-8"
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(30,200,165,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.12), transparent 35%)',
          }}
        />
        <div className="relative text-center max-w-xl mx-auto">
          <img
            src={STOYANGU_LOGO}
            alt="StoYangu"
            className="mx-auto h-28 w-28 sm:h-36 sm:w-36 object-contain drop-shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
          />
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">{store.name}</h1>
          <div className="mt-3 inline-flex items-center gap-2 flex-wrap justify-center">
            <a
              href={`https://${link}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/25 text-teal-200 text-sm hover:bg-teal-500/25 transition"
            >
              {link}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button onClick={copyLink} className="btn-ghost py-1.5 px-3 text-xs">
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-5">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-sky-500/15 text-sky-300 mb-3">
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-white">
                {formatNumber(store.total_visitors)}
              </div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1">People who visited</div>
            </div>
            <div className="rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-5">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-300 mb-3">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-white">
                {formatNumber(store.total_wa_clicks)}
              </div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1">WhatsApp order taps</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Products — white card on dark page */}
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Products</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {products.length} item{products.length === 1 ? '' : 's'} in your catalog
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="p-10 sm:p-14 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mb-4">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-slate-900">No products yet</h3>
            <p className="text-sm mt-1 max-w-sm mx-auto text-slate-500">
              Add your first product so customers can browse and order on WhatsApp.
            </p>
            <button onClick={openAdd} className="btn-primary mt-5">
              <Plus className="w-4 h-4" />
              Add product
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.24) }}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/80 ${
                  p.is_hidden ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-slate-100 border border-slate-200">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate text-slate-900">{p.name}</h3>
                      {p.is_hidden && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 bg-slate-100">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium mt-0.5 text-teal-600">{formatPrice(p.price)}</div>
                    {p.description && (
                      <p className="text-xs mt-1 line-clamp-2 text-slate-500">{p.description}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-[11px] text-slate-400">
                      <span>{formatNumber(p.views)} views</span>
                      <span>{formatNumber(p.orders)} order taps</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    onClick={() => openEdit(p)}
                    disabled={busyId === p.id}
                    className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleHide(p)}
                    disabled={busyId === p.id}
                    className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    {p.is_hidden ? 'Unhide' : 'Hide'}
                  </button>
                  <button
                    onClick={() => deleteProduct(p)}
                    disabled={busyId === p.id}
                    className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <ProductModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={saveProduct}
      />
    </AppShell>
  );
}
