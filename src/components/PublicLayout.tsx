import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STOYANGU_LOGO } from '../lib/brand';
import ApplyModal from './ApplyModal';

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.5 1 .4.4.7.9 1 1.5.2.4.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-1 1.5-.4.4-.9.7-1.5 1-.4.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.5-1-.4-.4-.7-.9-1-1.5-.2-.4-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 1-1.5.4-.4.9-.7 1.5-1 .4-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.2 0-3.5 0-4.8.1-1 .1-1.6.2-1.9.4-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.2.4-.3.9-.4 1.9-.1 1.2-.1 1.6-.1 4.8s0 3.5.1 4.8c.1 1 .2 1.6.4 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.2.9.3 1.9.4 1.2.1 1.6.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.2 1.9-.4.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.2-.4.3-.9.4-1.9.1-1.2.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1-.2-1.6-.4-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.4-.2-.9-.3-1.9-.4-1.3-.1-1.6-.1-4.8-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm6.1-2a1.2 1.2 0 1 1 0 2.3 1.2 1.2 0 0 1 0-2.3z" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.6 7.2a5.7 5.7 0 0 1-3.4-1.1v7.2a5.5 5.5 0 1 1-4.7-5.4v2.5a3 3 0 1 0 2.1 2.9V2.2h2.5c.2 1.5 1.1 2.9 2.4 3.8a5.7 5.7 0 0 0 3.1 1v2.5c-.7 0-1.4-.1-2-.3z" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.1-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8.1v2.8h2.4V21h3z" />
    </svg>
  );
}

function XIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 3h2.7l-5.9 6.7L21.5 21h-5.8l-4.5-5.9L6 21H3.3l6.3-7.2L2.7 3h6l4.1 5.4L17.5 3zm-1 16.2h1.5L7.6 4.7H6L16.5 19.2z" />
    </svg>
  );
}

const socials = [
  { name: 'Instagram', href: 'https://instagram.com/stoyangu', Icon: InstagramIcon },
  { name: 'TikTok', href: 'https://www.tiktok.com/@stoyangu', Icon: TikTokIcon },
  { name: 'Facebook', href: 'https://facebook.com/stoyangu', Icon: FacebookIcon },
  { name: 'X', href: 'https://x.com/stoyangu', Icon: XIcon },
];

export default function PublicLayout({
  children,
  bare = false,
}: {
  children: React.ReactNode;
  bare?: boolean;
}) {
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-[360px] h-[360px] rounded-full bg-cyan-600/10 blur-3xl" />
      </div>

      {!bare && (
        <header className="relative z-20 sticky top-0 bg-navy-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-3 group min-w-0">
              <img
                src={STOYANGU_LOGO}
                alt="StoYangu"
                className="h-11 w-11 object-contain drop-shadow-[0_0_12px_rgba(30,200,165,0.35)] group-hover:scale-105 transition shrink-0"
              />
              <div className="leading-tight min-w-0">
                <div className="font-semibold tracking-wide text-white">
                  Sto<span className="text-teal-400">Yangu</span>
                </div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400 truncate">
                  Online stores for sellers
                </div>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/stores"
                className="hidden sm:inline px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Stores
              </Link>
              <Link
                to="/about"
                className="hidden sm:inline px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                How it works
              </Link>
              <Link
                to="/login"
                className="px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>
              <button onClick={() => setApplyOpen(true)} className="btn-primary !py-2 !px-3 text-xs sm:text-sm">
                Video Yangu, Store Yangu
              </button>
            </nav>
          </div>
        </header>
      )}

      <main className="relative z-10">{children}</main>

      {!bare && (
        <footer className="relative z-10 border-t border-white/5 mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={STOYANGU_LOGO} alt="" className="h-9 w-9 object-contain" />
                <span className="font-semibold text-white">
                  Sto<span className="text-teal-400">Yangu</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                We build simple online stores for Kenyans who sell physical products on social media.
                Customers see your products, click order, and you get the message on WhatsApp.
              </p>
              <a
                href="mailto:info@stoyangu.com"
                className="inline-block mt-3 text-sm text-teal-300 hover:text-teal-200"
              >
                info@stoyangu.com
              </a>
              <div className="mt-5 flex items-center gap-2">
                {socials.map(({ name, href, Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${name} @stoyangu`}
                    title={`${name} @stoyangu`}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-teal-300 hover:border-teal-400/30 hover:bg-teal-500/10 transition inline-flex items-center justify-center"
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </a>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-600">@stoyangu</p>
            </div>
            <div className="flex flex-col sm:items-end gap-2 text-sm">
              <button
                onClick={() => setApplyOpen(true)}
                className="text-teal-300 hover:text-teal-200 text-left sm:text-right"
              >
                Video Yangu, Store Yangu
              </button>
              <Link to="/stores" className="text-slate-400 hover:text-white">
                Browse stores
              </Link>
              <Link to="/about" className="text-slate-400 hover:text-white">
                How it works
              </Link>
              <Link to="/login" className="text-slate-400 hover:text-white">
                Owner login
              </Link>
              <p className="text-xs text-slate-600 mt-3">
                © {new Date().getFullYear()} StoYangu · Kenya
              </p>
            </div>
          </div>
        </footer>
      )}

      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}

export function useOpenApply() {
  return () => window.dispatchEvent(new CustomEvent('stoyangu:open-apply'));
}
