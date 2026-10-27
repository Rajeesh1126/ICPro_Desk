import { QueryClient } from "@tanstack/react-query";

/**
 * App-wide request cache (stale-while-revalidate).
 *
 * - Cached data renders immediately when a page remounts; if it is older than
 *   `staleTime`, a silent background refetch runs.
 * - Identical requests are deduplicated, which also absorbs React Strict Mode's
 *   double-mounted effects in development.
 * - `retry: false` keeps the existing behaviour: the axios interceptor already
 *   routes HTTP and connection failures to the error page.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

/* -------------------------------------------------------------------------- */
/* Freshness policy                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Per-user, frequently changing data (tickets, Do List, timesheets,
 * approvals, dashboards). Showing an old copy and then swapping it for new
 * numbers a few seconds later makes the app look broken, so these follow a
 * stricter rule than reference data:
 *
 * - Always refetch when a page opens, when the browser tab regains focus and
 *   when the network reconnects (`staleTime: 0`).
 * - Keep a cached copy only briefly after its page closes (`gcTime`). Quick
 *   back-and-forth navigation is still instant and effectively current, but
 *   a page reopened later shows its skeleton until fresh data arrives,
 *   never a stale copy that changes in front of the user.
 */
const LIVE_ENDPOINT_PREFIXES = [
  "/calendar/",
  "/tickets/",
  "/self-tickets/",
  "/summary/",
  "/timesheet-entries/",
  "/timesheet-week-logs/",
  "/timesheet-analysis/",
  "/approvals/",
  "/approval-detail-data/",
  "/erp/quotations/budget-summary/",
] as const;

/** How long a closed page's live data may be reused (quick back/forward). */
export const LIVE_CACHE_MS = 20_000;

export const isLiveEndpoint = (url: string) =>
  LIVE_ENDPOINT_PREFIXES.some((prefix) => url.startsWith(prefix));

/**
 * Query options for an endpoint. Live data: always revalidated and only
 * briefly cached. Reference data (users, roles, departments, projects,
 * phases, cost categories, documents): the default 30 s stale-while-revalidate.
 */
export const freshnessFor = (url: string) =>
  isLiveEndpoint(url)
    ? {
        staleTime: 0,
        gcTime: LIVE_CACHE_MS,
        refetchOnMount: "always" as const,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      }
    : {};

let invalidateTimer: number | undefined;
const pendingInvalidationPrefixes = new Set<string>();

const mutationDependencies: ReadonlyArray<{
  mutationPrefix: string;
  queryPrefixes: readonly string[];
}> = [
  { mutationPrefix: "/timesheet-entries/", queryPrefixes: ["/timesheet-entries/", "/timesheet-week-logs/", "/approvals/", "/summary/"] },
  { mutationPrefix: "/timesheet-week-logs/", queryPrefixes: ["/timesheet-week-logs/", "/timesheet-entries/", "/approvals/"] },
  { mutationPrefix: "/approvals/", queryPrefixes: ["/approvals/", "/timesheet-week-logs/", "/summary/"] },
  { mutationPrefix: "/projects/", queryPrefixes: ["/projects/", "/timesheet-entries/"] },
  { mutationPrefix: "/milestones/", queryPrefixes: ["/milestones/", "/projects/"] },
  { mutationPrefix: "/tasks/", queryPrefixes: ["/tasks/", "/projects/", "/timesheet-entries/"] },
  { mutationPrefix: "/phases/", queryPrefixes: ["/phases/"] },
  { mutationPrefix: "/tickets/", queryPrefixes: ["/tickets/", "/summary/"] },
  { mutationPrefix: "/self-tickets/", queryPrefixes: ["/self-tickets/"] },
  { mutationPrefix: "/users/", queryPrefixes: ["/users/"] },
  { mutationPrefix: "/departments/", queryPrefixes: ["/departments/", "/users/"] },
  { mutationPrefix: "/roles/", queryPrefixes: ["/roles/", "/users/"] },
  { mutationPrefix: "/documents/", queryPrefixes: ["/documents/"] },
];

/**
 * Called after every successful create/edit/delete request. Rather than each
 * page bumping a refresh key when any dialog closes, cached lists are marked
 * stale only when data actually changed. Mounted queries refetch in the
 * background; others refetch the next time their page opens. Bursts (e.g.
 * saving several roles) collapse into one refresh.
 */
export function invalidateAfterMutation(url = "") {
  const matchingDependency = mutationDependencies.find(({ mutationPrefix }) =>
    url.startsWith(mutationPrefix),
  );
  const fallbackPrefix = `/${url.split("/").filter(Boolean)[0] ?? ""}/`;
  const prefixes = matchingDependency?.queryPrefixes ?? [fallbackPrefix];
  prefixes.forEach((prefix) => pendingInvalidationPrefixes.add(prefix));

  window.clearTimeout(invalidateTimer);
  invalidateTimer = window.setTimeout(() => {
    const prefixesToInvalidate = [...pendingInvalidationPrefixes];
    pendingInvalidationPrefixes.clear();
    void queryClient.invalidateQueries({
      predicate: ({ queryKey }) => {
        const endpoint = queryKey[0];
        return (
          typeof endpoint === "string" &&
          prefixesToInvalidate.some((prefix) => endpoint.startsWith(prefix))
        );
      },
    });
  }, 60);
}
