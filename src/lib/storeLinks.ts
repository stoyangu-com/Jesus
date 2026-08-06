/**
 * Parses a store slug from the current hostname.
 * Example: 'ded.stoyangu.com' -> 'ded'
 * Example: 'stoyangu.com' -> null
 * Example: 'www.stoyangu.com' -> null
 */
export function getStoreSlugFromHost(hostname: string): string | null {
  if (!hostname) return null;

  const host = hostname.toLowerCase();

  // 1. Basic checks for root domain or www
  if (host === 'stoyangu.com' || host === 'www.stoyangu.com') {
    return null;
  }

  // 2. Check if it's a .stoyangu.com subdomain
  if (host.endsWith('.stoyangu.com')) {
    const subdomain = host.replace(/\.stoyangu\.com$/, '');

    if (!subdomain) return null;

    // 3. Reserved subdomains
    const reserved = ['www', 'api', 'app', 'admin', 'mail', 'ftp', 'cdn', 'static', 'vercel'];
    if (reserved.includes(subdomain)) {
      return null;
    }

    // 4. Only allow single-level subdomains for now (e.g., ded.stoyangu.com)
    // If there are dots in the subdomain, it's likely not a simple store slug
    if (subdomain.includes('.')) {
      return null;
    }

    return subdomain;
  }

  // 5. Preview hosts (*.vercel.app) usually don't match our store logic
  // unless specifically mapped, so we return null.
  return null;
}

export function publicStorePath(slug: string) {
  return `/s/${slug}`;
}
