import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, MessageCircle, ShoppingBag, Share2 } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import ApplyModal from '../components/ApplyModal';
import Seo from '../components/Seo';

export default function About() {
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <PublicLayout>
      <Seo
        title="How StoYangu works — Online stores + WhatsApp orders"
        description="See how StoYangu works for Kenyan sellers. Customers open your store, pick a product, click order, and you get WhatsApp instantly. Setup KES 5,000 · KES 300/month."
        path="/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'How StoYangu works',
          url: 'https://stoyangu.com/about',
          description:
            'StoYangu builds online stores for Kenyans who sell physical products on social media.',
        }}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="glass-card p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">How StoYangu works</h1>
          <p className="mt-4 text-slate-400 leading-relaxed">
            StoYangu builds online stores for Kenyans who sell physical products using social media.
            Your customers get one clean link. You keep selling on WhatsApp — just smarter.
          </p>

          <div className="mt-8 space-y-5">
            {[
              {
                icon: Share2,
                title: 'You share one store link',
                body: 'Put it on your videos, status, bio, flyers — anywhere people find you.',
              },
              {
                icon: ShoppingBag,
                title: 'They see your products',
                body: 'Clear photos, prices, and short details. No confusion. No hunting through old chats.',
              },
              {
                icon: MessageCircle,
                title: 'They click Order',
                body: 'You get a WhatsApp message right away with what they want. You reply and finish the sale.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4 rounded-2xl bg-white/[0.03] border border-white/8 p-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-300 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{item.title}</h2>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="mt-10 text-xl font-semibold text-white">What it costs</h2>
          <ul className="mt-3 space-y-2 text-slate-300 text-sm">
            <li className="flex gap-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">KES 5,000</strong> — one-time setup for your website
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">KES 300 every month</strong> — maintenance (hosting,
                upkeep, and keeping orders flowing to WhatsApp)
              </span>
            </li>
          </ul>

          <h2 className="mt-10 text-xl font-semibold text-white">Video Yangu, Store Yangu</h2>
          <p className="mt-3 text-slate-400 leading-relaxed text-sm sm:text-base">
            Record a short 1-minute video about your biashara (who you are, what you sell, and that your
            store is from StoYangu). If we approve you, you get a StoYangu store plus your first month of
            maintenance covered. Tutakupigia WhatsApp with next steps.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button onClick={() => setApplyOpen(true)} className="btn-primary">
              Apply — Video Yangu, Store Yangu
            </button>
            <Link to="/stores" className="btn-ghost">
              Browse stores
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Email us:{' '}
            <a href="mailto:info@stoyangu.com" className="text-teal-300 hover:text-teal-200">
              info@stoyangu.com
            </a>
          </p>
        </div>
      </article>

      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </PublicLayout>
  );
}
