const DEFAULT_TIMEOUT_MS = 10000;

const memoryCache = new Map<string, unknown>();

export interface FetchResult<T> {
  data: T;
  sourceUrl: string;
}

const fetchWithTimeout = async (url: string): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const fetchJsonWithFallback = async <T>(urls: string[]): Promise<FetchResult<T>> => {
  let lastError: Error | null = null;

  for (const url of urls) {
    const cached = memoryCache.get(url);
    if (cached) {
      return { data: cached as T, sourceUrl: url };
    }

    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        lastError = new Error(`Request failed with status ${response.status}`);
        continue;
      }

      const data = (await response.json()) as T;
      memoryCache.set(url, data);
      return { data, sourceUrl: url };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown fetch error");
    }
  }

  throw lastError ?? new Error("All fallback requests failed");
};
