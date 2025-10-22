// handling time out and errors for fetch requests
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:3000';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
) {
  const url = new URL(path, API_BASE);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), 12_000);
  try {
    const res = await fetch(url.toString(), { signal: ctl.signal });
    return await handle<T>(res);
  } finally {
    clearTimeout(id);
  }
}
