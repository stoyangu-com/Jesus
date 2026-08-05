import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, MessageCircle, Package, ArrowLeft } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import Seo from '../components/Seo';
import LoadingScreen from '../components/LoadingScreen';
import { formatPrice } from '../lib/api';
import { STOYANGU_LOGO } from '../lib/brand';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
};

type Store = {
  id: number;
  name: string;
  slug: string;
  owner_name: string;
  whatsapp: string;
  logo_url: string | null;
  public_url: string;
  path_url: string;
};

function waLink(whatsapp: string, storeName: string, productName?: string) {
  let num = String(whatsapp || '').replace(/\D/g, '');
  if (num.startsWith('0')) num = `254${num.slice(1)}`;
  if (num.startsWith('254')) {
    /* ok */
  } else if (num.length >= 9) {
    num = `254${num}`;
  }
  const text = productName
    ? `Hi ${storeName}! I want to order: ${productName} (from StoYangu)`
    : `Hi ${storeName}! I found you on StoYangu and I want to order.`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

export default function PublicStore() {
  const { slug = '' } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/public-stores?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Store not found');
        setStore(data.store);
        setProducts(data.products || []);

        if (data.store?.id) {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'visit', store_id: data.store.id }),
          }).catch(() => undefined);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Store not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <LoadingScreen label="Opening store…" />;

  if (!store) {
    return (
      <PublicLayout>
        <Seo
          title="Store not found | StoYangu"
          description="This StoYangu store could not be found."
          path={`/s/${slug}`}
          noindex
        />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-slate-400">{error || 'Store not found.'}</p>
          <Link to="/stores" className="btn-primary mt-4 inline-flex">
            Browse stores
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const description =
    products.length > 0
      ? `Shop ${store.name} on StoYangu — ${products
          .slice(0, 4)
          .map((p) => p.name)
          .join(', ')}. Order on WhatsApp.`
      : `Visit ${store.name} on StoYangu. See products and order on WhatsApp in Kenya.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    url: `https://stoyangu.com/s/${store.slug}`,
    image: store.logo_url || 'https://stoyangu.com/stoyangu-mark.png',
    description,
    telephone: store.whatsapp,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KE',
    },
    brand: {
      '@type': 'Brand',
      name: 'StoYangu',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${store.name} products`,
      itemListElement: products.map((p, i) => ({
        '@type': 'Offer',
        position: i + 1,
        itemOffered: {
          '@type': 'Product',
          name: p.name,
          description: p.description || undefined,
          image: p.image_url || undefined,
        },
        price: Number(p.price || 0),
        priceCurrency: 'KES',
        availability: 'https://schema.org/InStock',
        url: `https://stoyangu.com/s/${store.slug}`,
      })),
    },
  };

  const onWa = async (product?: Product) => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wa_click',
          store_id: store.id,
          product_id: product?.id,
        }),
      });
    } catch {
      /* ignore */
    }
    window.open(waLink(store.whatsapp, store.name, product?.name), '_blank', 'noopener,noreferrer');
  };

  return (
    <PublicLayout>
      <Seo
        title={`${store.name} | Order on WhatsApp — StoYangu`}
        description={description}
        path={`/s/${store.slug}`}
        image={store.logo_url || undefined}
        jsonLd={jsonLd}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Link
          to="/stores"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> All stores
        </Link>

        <div className="space-y-5">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy-900 via-navy-900 to-teal-950/40 px-6 py-10 sm:px-10 text-center">
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 20% 20%, rgba(30,200,165,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.12), transparent 35%)',
              }}
            />
            <div className="relative">
              <img
                src={store.logo_url || STOYANGU_LOGO}
                alt={`${store.name} logo`}
                className="mx-auto h-24 w-24 sm:h-28 sm:w-28 object-contain drop-shadow-xl"
              />
              <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-white">{store.name}</h1>
              <p className="mt-2 text-slate-400 text-sm">by {store.owner_name} · on StoYangu</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/25 text-teal-200 text-sm">
                  {store.slug}.stoyangu.com
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
                <button
                  onClick={() => onWa()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-medium hover:brightness-110"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Order on WhatsApp
                </button>
              </div>
            </div>
          </section>

          <section className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Products</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {products.length} item{products.length === 1 ? '' : 's'} · Tap Order to message on WhatsApp
              </p>
            </div>

            {products.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                Products coming soon.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-5">
                {products.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.03] hover:border-teal-400/25 transition"
                  >
                    <div className="aspect-[4/3] bg-navy-800 flex items-center justify-center">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-slate-600" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white">{p.name}</h3>
                      <p className="text-teal-300 font-medium text-sm mt-0.5">{formatPrice(p.price)}</p>
                      {p.description && (
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{p.description}</p>
                      )}
                      <button onClick={() => onWa(p)} className="btn-primary w-full mt-3 !py-2 text-xs">
                        <MessageCircle className="w-3.5 h-3.5" />
                        Order on WhatsApp
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
