import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE;

async function handle<T>(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${text || res.statusText}`);
  }
  const resJson = await res.json();
  return resJson.data;
}

export async function apiGet<T>(path: string, params?: Record<string, any>) {
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

export async function apiPost<T>(
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
