const REQUEST_TIMEOUT_MS = 10000;

const responseCache = new Map<string, unknown>();

const safeParseJson = (value: string) => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

export const fetchJsonWithFallback = async (urls: string[]) => {
  let lastError: Error | null = null;

  for (const url of urls) {
    if (responseCache.has(url)) {
      return responseCache.get(url);
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        lastError = new Error(`Request failed with status ${response.status}`);
        continue;
      }

      const data = (await response.json()) as unknown;
      responseCache.set(url, data);
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw lastError ?? new Error("Failed to fetch JSON from all fallbacks");
};

export const getCachedEditions = <T>(storageKey: string): T[] | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = window.localStorage.getItem(storageKey);
  if (!cached) {
    return null;
  }

  const parsed = safeParseJson(cached);
  return Array.isArray(parsed) ? (parsed as T[]) : null;
};

export const setCachedEditions = <T>(storageKey: string, editions: T[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(editions));
};

export const buildFawazUrls = (primaryBase: string, fallbackBase: string, path: string) => {
  const normalizedPath = path.replace(/^\//, "");
  return [
    `${primaryBase}/${normalizedPath}.min.json`,
    `${primaryBase}/${normalizedPath}.json`,
    `${fallbackBase}/${normalizedPath}.min.json`,
    `${fallbackBase}/${normalizedPath}.json`,
  ];
};
