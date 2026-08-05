import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Eye,
  MessageCircle,
  Package,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Store,
  Activity,
  Send,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import LoadingScreen from '../components/LoadingScreen';
import { apiGet, apiSend, formatNumber, storeUrl } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { STOYANGU_LOGO } from '../lib/brand';
import Seo from '../components/Seo';

type Overview = {
  totalStores: number;
  activeStores: number;
  totalVisitors: number;
  totalWaClicks: number;
  totalProducts: number;
  visibleProducts: number;
  todayVisitors: number;
  todayWaClicks: number;
  conversionRate: number;
};

type StoreRow = {
  id: number;
  name: string;
  slug: string;
  owner_name: string;
  whatsapp: string;
  logo_url: string | null;
  total_visitors: number;
  total_wa_clicks: number;
  is_active: boolean;
  product_count: number;
  today_visitors: number;
  today_wa_clicks: number;
  created_at?: string;
};

export default function Management() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [reportMsg, setReportMsg] = useState('');
  const [sendingReport, setSendingReport] = useState(false);
  const [query, setQuery] = useState('');
  const [applications, setApplications] = useState<
    { id: number; full_name: string; phone: string; willing_video: boolean; status: string; created_at?: string }[]
  >([]);

  const load = useCallback(async (soft = false) => {
    if (soft) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [data, apps] = await Promise.all([
        apiGet<{ overview: Overview; stores: StoreRow[] }>('/api/analytics'),
        apiGet<{ id: number; full_name: string; phone: string; willing_video: boolean; status: string; created_at?: string }[]>(
          '/api/applications'
        ).catch(() => []),
      ]);
      setOverview(data.overview);
      setStores(data.stores || []);
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAsClient = (storeId: number) => {
    navigate(`/my-store?storeId=${storeId}`);
  };

  const runDailyReport = async (dryRun: boolean) => {
    setSendingReport(true);
    setReportMsg('');
    try {
      const data = await apiSend<{ sent: number; results: unknown[]; dry_run: boolean }>(
        `/api/daily-report?dry_run=${dryRun ? '1' : '0'}`,
        'POST',
        {}
      );
      setReportMsg(
        dryRun
          ? `Preview ready for ${data.results?.length || 0} store(s). Telnyx not contacted.`
          : `Daily report processed. Messages sent: ${data.sent}.`
      );
    } catch (e) {
      setReportMsg(e instanceof Error ? e.message : 'Report failed');
    } finally {
      setSendingReport(false);
    }
  };

  if (loading) return <LoadingScreen label="Loading management…" />;

  const filtered = stores.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.owner_name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.whatsapp.includes(q)
    );
  });

  const cards = [
    {
      label: 'Active stores',
      value: overview?.activeStores ?? 0,
      sub: `${overview?.totalStores ?? 0} total`,
      icon: Users,
      accent: 'from-teal-400/20 to-teal-500/5',
    },
    {
      label: 'Lifetime visitors',
      value: overview?.totalVisitors ?? 0,
      sub: `${formatNumber(overview?.todayVisitors)} today`,
      icon: Eye,
      accent: 'from-sky-400/20 to-sky-500/5',
    },
    {
      label: 'WhatsApp orders',
      value: overview?.totalWaClicks ?? 0,
      sub: `${formatNumber(overview?.todayWaClicks)} today`,
      icon: MessageCircle,
      accent: 'from-emerald-400/20 to-emerald-500/5',
    },
    {
      label: 'Products live',
      value: overview?.visibleProducts ?? 0,
      sub: `${overview?.totalProducts ?? 0} catalog total`,
      icon: Package,
      accent: 'from-violet-400/20 to-violet-500/5',
    },
    {
      label: 'WA conversion',
      value: `${overview?.conversionRate ?? 0}%`,
      sub: 'Clicks ÷ visitors',
      icon: TrendingUp,
      accent: 'from-amber-400/20 to-amber-500/5',
      raw: true,
    },
  ];

  return (
    <AppShell
      title="Management"
      subtitle="Business-wide pulse across every StoYangu store."
    >
      <Seo title="Management | StoYangu" description="Founder management" path="/management" noindex />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => load(true)} className="btn-ghost" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => runDailyReport(true)}
            className="btn-ghost"
            disabled={sendingReport || !session}
          >
            <Activity className="w-4 h-4" />
            Preview WA report
          </button>
          <button
            onClick={() => runDailyReport(false)}
            className="btn-ghost"
            disabled={sendingReport || !session}
          >
            <Send className="w-4 h-4" />
            Send daily WA
          </button>
        </div>
        <Link to="/new-client" className="btn-primary">
          + New client
        </Link>
      </div>

      {error && (
        <div className="mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {reportMsg && (
        <div className="mb-4 text-sm text-teal-200 bg-teal-500/10 border border-teal-400/20 rounded-xl px-4 py-3">
          {reportMsg}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 bg-gradient-to-br ${card.accent}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs uppercase tracking-wider text-slate-400">{card.label}</div>
                <div className="p-1.5 rounded-lg bg-white/5 text-teal-300">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                {card.raw ? card.value : formatNumber(Number(card.value))}
              </div>
              <div className="mt-1 text-xs text-slate-400">{card.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {applications.length > 0 && (
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-4 sm:px-5 py-4 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">Store applications</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              People who applied from the website ({applications.filter((a) => a.status === 'pending').length} pending)
            </p>
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
            {applications.slice(0, 30).map((app) => (
              <div key={app.id} className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-white truncate">{app.full_name}</div>
                  <div className="text-sm text-slate-400">{app.phone}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Video OK: {app.willing_video ? 'Yes' : 'No'}
                    {app.created_at ? ` · ${new Date(app.created_at).toLocaleString('en-KE')}` : ''}
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                    app.status === 'pending'
                      ? 'border-amber-400/30 text-amber-200 bg-amber-500/10'
                      : app.status === 'approved'
                        ? 'border-teal-400/30 text-teal-300 bg-teal-500/10'
                        : 'border-slate-500/30 text-slate-400 bg-white/5'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-teal-400" />
              All stores
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} client{filtered.length === 1 ? '' : 's'}</p>
          </div>
          <input
            className="input sm:max-w-xs"
            placeholder="Search store, owner, WhatsApp…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Store className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No stores yet. Create your first client to get started.</p>
            <Link to="/new-client" className="btn-primary mt-4 inline-flex">
              New client
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((store, idx) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-navy-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <img src={STOYANGU_LOGO} alt="" className="w-9 h-9 object-contain opacity-90" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white truncate">{store.name}</h3>
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          store.is_active
                            ? 'border-teal-400/30 text-teal-300 bg-teal-500/10'
                            : 'border-slate-500/30 text-slate-400 bg-white/5'
                        }`}
                      >
                        {store.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 truncate">
                      {store.owner_name} · {store.whatsapp}
                    </div>
                    <a
                      href={`https://${storeUrl(store.slug)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-teal-300/90 hover:text-teal-200 mt-0.5"
                    >
                      {storeUrl(store.slug)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:w-[420px]">
                  <StatChip label="Visitors" value={store.total_visitors} />
                  <StatChip label="WA clicks" value={store.total_wa_clicks} />
                  <StatChip label="Today visits" value={store.today_visitors} />
                  <StatChip label="Products" value={store.product_count} />
                </div>

                <button
                  onClick={() => openAsClient(store.id)}
                  className="btn-primary whitespace-nowrap shrink-0"
                >
                  Open My Store
                  <ExternalLink className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-100">{formatNumber(value)}</div>
    </div>
  );
}
