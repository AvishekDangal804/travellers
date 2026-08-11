"use client";

import { useCallback, useEffect, useState } from "react";

/** Fetches JSON from `url` on mount/url-change; re-run with `reload()`. */
export function usePanelFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    fetch(url)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
        setData(body as T);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
