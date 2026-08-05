import supabase from './supabase';

export async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(path, { headers: await authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export async function apiSend<T = unknown>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: await authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export async function uploadFile(file: File, folder = 'uploads'): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const parts = result.split(',');
      resolve(parts[1] || '');
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  const data = await apiSend<{ url: string }>('/api/upload', 'POST', {
    fileName: file.name,
    fileBase64: base64,
    contentType: file.type || 'image/png',
    folder,
  });

  return data.url;
}

export function formatNumber(n: number | null | undefined) {
  return Number(n || 0).toLocaleString('en-KE');
}

export function formatPrice(n: number | null | undefined) {
  return `KES ${Number(n || 0).toLocaleString('en-KE')}`;
}

export function storeUrl(slug: string) {
  return `${slug}.stoyangu.com`;
}
