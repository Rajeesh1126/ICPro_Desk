import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import api from "./axios";
import { freshnessFor, queryClient } from "./queryClient";

type Params = Record<string, string | number | boolean | undefined | null>;

/** Stable cache key: the endpoint plus its params (undefined params dropped). */
export const apiQueryKey = (url: string, params?: Params) => {
  const cleaned = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
  return Object.keys(cleaned).length ? [url, cleaned] : [url];
};

/** GET that is cancelled (via AbortSignal) when its page unmounts or the key changes. */
export const fetchApi = async <T>(url: string, params?: Params, signal?: AbortSignal) => {
  const response = await api.get<T>(url, { params, signal });
  return response.data;
};

/**
 * Changing a key (filters, date range, week) never shows the previous key's
 * rows: the new key has no data yet, so `isPending` drives a skeleton until
 * the matching response arrives.
 */
type ApiQueryOptions<T> = Omit<UseQueryOptions<T, Error, T, readonly unknown[]>, "queryKey" | "queryFn">;

/**
 * Cached, deduplicated, abortable GET.
 * `isPending` is true only when there is nothing cached yet, so skeletons
 * appear whenever no usable copy exists. Reference data is shown from cache
 * and refreshed in the background; live per-user data (see `freshnessFor`)
 * is always refetched and only reused for a short time after leaving a page.
 */
export function useApiQuery<T>(url: string, params?: Params, options: ApiQueryOptions<T> = {}) {
  return useQuery<T, Error, T, readonly unknown[]>({
    queryKey: apiQueryKey(url, params),
    queryFn: ({ signal }) => fetchApi<T>(url, params ?? undefined, signal),
    ...freshnessFor(url),
    ...options,
  });
}

/** Warm the cache (e.g. on sidebar hover) without rendering anything. */
export const prefetchApi = (url: string, params?: Params) =>
  queryClient.prefetchQuery({
    queryKey: apiQueryKey(url, params),
    queryFn: ({ signal }) => fetchApi(url, params, signal),
    ...freshnessFor(url),
  });

/**
 * Imperative cached GET for data loaded on demand (e.g. when a dialog opens):
 * returns fresh cached data without a request, otherwise fetches and caches.
 */
export const fetchCached = <T>(url: string, params?: Params) =>
  queryClient.fetchQuery({
    queryKey: apiQueryKey(url, params),
    queryFn: ({ signal }) => fetchApi<T>(url, params, signal),
    staleTime: 30_000,
    // Live data is never reused here: a dialog always gets the current state.
    ...freshnessFor(url),
  });

/** Normalises list endpoints that may return a non-array on edge cases. */
export const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
