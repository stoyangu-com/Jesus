import { useEffect } from 'react';

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const SITE = 'https://stoyangu.com';
const DEFAULT_IMAGE = `${SITE}/stoyangu-mark.png`;

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function Seo({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  noindex = false,
  type = 'website',
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const url = path.startsWith('http') ? path : `${SITE}${path.startsWith('/') ? path : `/${path}`}`;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    upsertMeta('name', 'googlebot', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('name', 'author', 'StoYangu');
    upsertMeta('name', 'theme-color', '#07111F');

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', 'StoYangu');
    upsertMeta('property', 'og:locale', 'en_KE');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);

    upsertLink('canonical', url);

    const scriptId = 'stoyangu-jsonld';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    if (jsonLd && !noindex) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [title, description, path, image, noindex, type, jsonLd]);

  return null;
}
