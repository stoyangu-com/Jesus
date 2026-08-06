import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import JsonStorefront from '../components/storefront/JsonStorefront';

interface StoreData {
  store: {
    id: string;
    name: string;
    slug: string;
    whatsapp: string;
    logo_url: string;
    design_json: any;
    [key: string]: any;
  };
  products: any[];
}

const PublicStore: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStore() {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/public-stores?slug=${slug}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Store not found');
          throw new Error('Failed to load store');
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, [slug]);

  const trackVisit = async () => {
    if (!data?.store?.id) return;
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'visit',
          store_id: data.store.id,
        }),
      });
    } catch (err) {
      console.error('Track visit error:', err);
    }
  };

  const trackOrder = async (productName: string, productId?: string | number) => {
    if (!data?.store?.id) return;
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wa_click',
          store_id: data.store.id,
          product_id: productId,
        }),
      });
    } catch (err) {
      console.error('Track order error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🏪</div>
          <h1 className="text-2xl font-bold mb-2">{error || 'Store not found'}</h1>
          <p className="text-gray-600 mb-8">The storefront you're looking for doesn't exist or is currently inactive.</p>
          <a
            href="/"
            className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold transition-transform hover:scale-105"
          >
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <JsonStorefront
      storeName={data.store.name}
      storeSlug={data.store.slug}
      whatsapp={data.store.whatsapp}
      logoUrl={data.store.logo_url}
      design={data.store.design_json || {}}
      dbProducts={data.products || []}
      onVisit={trackVisit}
      onOrder={trackOrder}
    />
  );
};

export default PublicStore;
