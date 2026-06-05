import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic async data loader hook.
 *
 * @param {() => Promise<any>} fetcher - Async function that returns data.
 * @param {{ initialData?: any, enabled?: boolean, key?: string|number }} options
 *   - `key`: a single primitive (string or number) that changes whenever you
 *     want the fetch to re-run (e.g. `key: id` or `key: \`${page}-${filter}\``).
 *     Replaces the old `deps` array to avoid an un-analysable spread in the
 *     useEffect dependency list.
 */
export default function useFetch(fetcher, options = {}) {
  const { initialData = null, enabled = true, key = 0 } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const refetch = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
      return result;
    } catch (err) {
      console.error("useFetch error:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcherRef.current();
        if (cancelled) return;
        setData(result);
      } catch (err) {
        if (cancelled) return;
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [enabled, key]);

  return { data, setData, loading, error, refetch };
}
