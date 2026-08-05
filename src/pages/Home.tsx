import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  BellRing,
  ArrowRight,
  Check,
  Video,
  Smartphone,
  Store,
  Sparkles,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import ApplyModal from '../components/ApplyModal';
import Seo from '../components/Seo';
import { STOYANGU_LOGO } from '../lib/brand';

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'StoYangu',
  url: 'https://stoyangu.com',
  logo: 'https://stoyangu.com/stoyangu-mark.png',
  email: 'info@stoyangu.com',
  description:
    'StoYangu builds online stores for Kenyans who sell physical products on social media. Customers browse products and order on WhatsApp.',
  areaServed: { '@type': 'Country', name: 'Kenya' },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'KES',
    price: '5000',
    description: 'Online store setup KES 5,000. Monthly maintenance KES 300.',
  },
};

export default function Home() {
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    const open = () => setApplyOpen(true);
    window.addEventListener('stoyangu:open-apply', open);
    return () => window.removeEventListener('stoyangu:open-apply', open);
  }, []);

  return (
    <PublicLayout>
      <Seo
        title="StoYangu — Online stores for Kenyans who sell on social media"
        description="Get a simple online store for your business in Kenya. Customers see your products, click order, and you get WhatsApp instantly. Setup KES 5,000 · maintenance KES 300/month. Video Yangu, Store Yangu."
        path="/"
        jsonLd={orgJsonLd}
      />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-6">
        {/* Campaign attention strip */}
        <motion.button
          type="button"
          onClick={() => setApplyOpen(true)}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-7 sm:mb-9 group text-left"
        >
          <div className="relative overflow-hidden rounded-2xl border border-teal-400/30 bg-gradient-to-r from-teal-500/20 via-teal-500/10 to-cyan-500/10 px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:border-teal-300/50 transition">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(45,212,191,0.15),transparent_50%)] pointer-events-none" />
            <div className="relative flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-400 text-navy-950 font-bold">
                    LIMITED
                  </span>
                </div>
                <div className="text-base sm:text-lg font-semibold text-white mt-0.5">
                  Video Yangu, Store Yangu
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-snug">
                  Shoot a 1-min clip about your biashara — get your StoYangu store + first month covered.
                </p>
              </div>
            </div>
            <span className="relative inline-flex items-center justify-center gap-2 self-start sm:self-center rounded-xl bg-teal-400 text-navy-950 font-semibold text-sm px-4 py-2.5 group-hover:brightness-110 shrink-0">
              Apply sasa
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </motion.button>

        {/* Photo sits between LIMITED banner and hero copy */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="relative mb-8 sm:mb-10"
        >
          <div className="absolute -inset-2 sm:-inset-3 rounded-[2rem] bg-teal-500/10 blur-2xl" />
          <div className="relative rounded-[1.75rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
            <img
              src="/images/hero-seller-video.jpg"
              alt="Young seller recording a product video on her phone"
              className="w-full h-[240px] sm:h-[360px] lg:h-[400px] object-cover object-[center_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <div className="glass-card px-4 py-3 flex items-center gap-3 max-w-md">
                <img src={STOYANGU_LOGO} alt="" className="h-10 w-10 object-contain" />
                <div>
                  <div className="text-sm font-medium text-white">Film. Sell. Get orders.</div>
                  <div className="text-xs text-slate-400">Your content → your store → WhatsApp</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 mb-5">
            For Kenyans who sell real products on social media
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.12]">
            One link for all your products.{' '}
            <span className="text-teal-300">Orders come on WhatsApp.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
            Stop sending many photos in chats. StoYangu gives you a simple online store. People open
            your link, see what you sell, click <strong className="text-slate-200">Order</strong>, and
            you get the message on WhatsApp straight away.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button onClick={() => setApplyOpen(true)} className="btn-primary text-base !px-5 !py-3">
              Apply — Video Yangu, Store Yangu
              <Video className="w-4 h-4" />
            </button>
            <Link to="/about" className="btn-ghost text-base !px-5 !py-3">
              See how it works
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Normal price: <span className="text-slate-300">KES 5,000</span> setup ·{' '}
            <span className="text-slate-300">KES 300</span>/month maintenance
          </p>
        </motion.div>
      </section>

      {/* SIMPLE STEPS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">It is very simple</h2>
          <p className="mt-2 text-slate-400">Three steps. No long story.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              n: '1',
              icon: ShoppingBag,
              title: 'Someone opens your store',
              body: 'They click your link from TikTok, Instagram, WhatsApp status, or a flyer.',
              img: '/images/customer-phone.jpg',
            },
            {
              n: '2',
              icon: Smartphone,
              title: 'They see your products',
              body: 'Photos, prices, and short details — all in one clean place.',
              img: '/images/seller-fashion.jpg',
            },
            {
              n: '3',
              icon: BellRing,
              title: 'They click Order',
              body: 'You get a WhatsApp message immediately so you can reply and close the sale.',
              img: '/images/seller-beauty.jpg',
            },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-card overflow-hidden"
              >
                <div className="h-40 overflow-hidden">
                  <img src={step.img} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-300 text-xs font-semibold flex items-center justify-center">
                      {step.n}
                    </span>
                    <Icon className="w-4 h-4 text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="glass-card p-6 sm:p-8 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">Made for people who already sell</h2>
            <p className="mt-3 text-slate-400 leading-relaxed">
              If you sell clothes, food, beauty products, shoes, crafts, or any physical product using
              WhatsApp, TikTok, Instagram or Facebook — StoYangu is for you.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                'One store link instead of many scattered photos',
                'Customers order you on WhatsApp — the app you already use',
                'Easy for you to add or hide products',
                'Looks serious and trusted',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="mt-0.5 w-5 h-5 rounded-md bg-teal-500/15 text-teal-300 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img
              src="/images/community.jpg"
              alt="Business owners"
              className="rounded-2xl h-44 sm:h-56 w-full object-cover border border-white/10"
            />
            <img
              src="/images/seller-food.jpg"
              alt="Seller packing orders"
              className="rounded-2xl h-44 sm:h-56 w-full object-cover border border-white/10 mt-6"
            />
            <img
              src="/images/hero-creator.jpg"
              alt="Creator filming product content"
              className="rounded-2xl h-44 sm:h-56 w-full object-cover border border-white/10 col-span-2"
            />
          </div>
        </div>
      </section>

      {/* PRICING + CAMPAIGN */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6 sm:p-7">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Normal price</div>
            <h2 className="text-2xl font-semibold text-white">Simple pricing</h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/[0.03] border border-white/8 px-4 py-4">
                <div className="text-sm text-slate-400">Website setup (one time)</div>
                <div className="text-3xl font-semibold text-white mt-1">KES 5,000</div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/8 px-4 py-4">
                <div className="text-sm text-slate-400">Monthly maintenance</div>
                <div className="text-3xl font-semibold text-white mt-1">
                  KES 300<span className="text-base font-medium text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Hosting, upkeep, and keeping orders flowing to your WhatsApp.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">
              No confusing packages. You get your store. Customers order you on WhatsApp.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-teal-400/25 bg-gradient-to-br from-teal-500/15 via-navy-900 to-navy-900 p-6 sm:p-7">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-xs text-teal-200 mb-3">
                <Video className="w-3.5 h-3.5" />
                Video Yangu, Store Yangu
              </div>
              <h2 className="text-2xl font-semibold text-white">1 minute video. Store yangu.</h2>
              <p className="mt-3 text-slate-300 leading-relaxed text-sm sm:text-base">
                Record a short clip about your biashara and get a StoYangu store plus your{' '}
                <strong className="text-white">first month of maintenance</strong> covered.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  Who you are
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  What you sell
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  That your store is from StoYangu
                </li>
              </ul>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                Apply sasa. If we approve you, tutakupigia WhatsApp and guide you.
              </p>
              <button onClick={() => setApplyOpen(true)} className="btn-primary w-full mt-6">
                Apply — Video Yangu, Store Yangu
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL — browse stores already on StoYangu */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="glass-card px-6 py-10 sm:px-10 sm:py-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-300 flex items-center justify-center mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">
            See stores already on StoYangu
          </h2>
          <p className="mt-3 text-slate-400 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Browse real shops, check their products, and order on WhatsApp — the same way your customers
            will.
          </p>
          <Link to="/stores" className="btn-primary mt-7 inline-flex !px-6 !py-3 text-base">
            Browse stores
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-5 text-xs text-slate-500">
            Questions?{' '}
            <a href="mailto:info@stoyangu.com" className="text-teal-300 hover:text-teal-200">
              info@stoyangu.com
            </a>
          </p>
        </div>
      </section>

      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </PublicLayout>
  );
}
