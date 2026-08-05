import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, LogOut, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { STOYANGU_LOGO } from '../lib/brand';

export default function AppShell({
  children,
  title,
  subtitle,
  theme = 'dark',
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** Light shell for store-owner My Store experience */
  theme?: 'dark' | 'light';
}) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isFounder = profile?.role === 'founder';
  const light = theme === 'light';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const nav = isFounder
    ? [
        { to: '/management', label: 'Management', icon: LayoutDashboard },
        { to: '/new-client', label: 'New Client', icon: UserPlus },
      ]
    : [{ to: '/my-store', label: 'My Store', icon: Store }];

  return (
    <div className={`min-h-screen ${light ? 'bg-[#e8eef5] text-slate-800' : 'bg-navy-950 text-slate-100'}`}>
      {!light && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[360px] h-[360px] rounded-full bg-cyan-600/10 blur-3xl" />
        </div>
      )}
      {light && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-16 w-[380px] h-[380px] rounded-full bg-teal-400/15 blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-[320px] h-[320px] rounded-full bg-sky-300/20 blur-3xl" />
        </div>
      )}

      <header
        className={`relative z-20 sticky top-0 backdrop-blur-xl border-b ${
          light
            ? 'bg-white/80 border-slate-200/80 shadow-sm shadow-slate-200/40'
            : 'bg-navy-950/80 border-white/5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to={isFounder ? '/management' : '/my-store'} className="flex items-center gap-3 group">
            <img
              src={STOYANGU_LOGO}
              alt="StoYangu"
              className="h-11 w-11 object-contain drop-shadow-md group-hover:scale-105 transition"
            />
            <div className="leading-tight">
              <div className={`font-semibold tracking-wide ${light ? 'text-slate-900' : 'text-white'}`}>
                Sto<span className="text-teal-500">Yangu</span>
              </div>
              <div
                className={`text-[11px] uppercase tracking-[0.18em] ${
                  light ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {isFounder ? 'Founder HQ' : 'My Store'}
              </div>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {nav.map((item) => {
              const active = location.pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition ${
                    active
                      ? light
                        ? 'bg-teal-500/15 text-teal-700 border border-teal-500/25'
                        : 'bg-teal-500/15 text-teal-300 border border-teal-400/20'
                      : light
                        ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block text-right">
              <div className={`text-sm font-medium ${light ? 'text-slate-900' : 'text-white'}`}>
                {profile?.full_name || 'User'}
              </div>
              <div className={`text-xs ${light ? 'text-slate-500' : 'text-slate-400'}`}>{profile?.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition ${
                light
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                  : 'bg-white/5 hover:bg-rose-500/15 text-slate-300 hover:text-rose-300 border-white/10'
              }`}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <div
          className={`sm:hidden border-t px-4 py-2 flex gap-2 overflow-x-auto ${
            light ? 'border-slate-200' : 'border-white/5'
          }`}
        >
          {nav.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                  active
                    ? light
                      ? 'bg-teal-500/15 text-teal-700 border border-teal-500/25'
                      : 'bg-teal-500/15 text-teal-300 border border-teal-400/20'
                    : light
                      ? 'bg-white text-slate-600 border border-slate-200'
                      : 'bg-white/5 text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {(title || subtitle) && (
          <div className="mb-6 sm:mb-8">
            {title && (
              <h1
                className={`text-2xl sm:text-3xl font-semibold tracking-tight ${
                  light ? 'text-slate-900' : 'text-white'
                }`}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className={`mt-1.5 text-sm sm:text-base ${light ? 'text-slate-500' : 'text-slate-400'}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
