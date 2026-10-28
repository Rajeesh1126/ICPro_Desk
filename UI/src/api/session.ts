import { useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { themeStorageKey } from "@/styles/theme/themeModeContext";
import { queryClient } from "@/api/queryClient";
import { WORK_ITEM_VIEW_SESSION_KEY } from "@/utils/useSessionState";

/** Query flag Login reads to explain why the user was signed out. */
export const SESSION_EXPIRED_PARAM = "session";
export const SESSION_EXPIRED_VALUE = "expired";
export const RETURN_TO_PARAM = "returnTo";

/** Removes the signed-in user's data while keeping device preferences (theme). */
export function clearSession() {
    const theme = localStorage.getItem(themeStorageKey);
    // Cancel in-flight requests and drop cached data so the next user never sees it.
    void queryClient.cancelQueries();
    queryClient.clear();
    localStorage.clear();
    sessionStorage.removeItem(WORK_ITEM_VIEW_SESSION_KEY);
    if (theme) localStorage.setItem(themeStorageKey, theme);
}

/**
 * Only app-internal paths are accepted as a post-login destination so a crafted
 * link cannot redirect a signed-in user to another site.
 */
export function getSafeReturnTo(value: string | null | undefined): string | null {
    if (!value) return null;
    if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
    if (!value.startsWith("/Home")) return null;
    return value;
}

function getAppRelativeLocation() {
    const basePath = import.meta.env.BASE_URL.endsWith("/")
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return {
        basePath,
        current: current.startsWith(basePath) ? current.slice(basePath.length - 1) : current,
    };
}

/**
 * Builds the router-relative Login URL. `expired` adds the explanation flag;
 * `returnTo` is kept only when it is a safe in-app destination.
 */
export function buildLoginPath(returnTo?: string | null, expired = false) {
    const params = new URLSearchParams();
    if (expired) params.set(SESSION_EXPIRED_PARAM, SESSION_EXPIRED_VALUE);
    const safe = getSafeReturnTo(returnTo);
    if (safe) params.set(RETURN_TO_PARAM, safe);
    const query = params.toString();
    return query ? `/?${query}` : "/";
}

let redirecting = false;

/** Clears the session and sends the user to Login with an explanation and a return path. */
export function expireSession() {
    if (redirecting) return;
    redirecting = true;
    const { basePath, current } = getAppRelativeLocation();
    clearSession();
    window.location.replace(`${basePath}${buildLoginPath(current, true).slice(1)}`);
}

/** Milliseconds until the stored token expires (≤ 0 if expired or unreadable). */
export function msUntilTokenExpiry(token = localStorage.getItem("accessToken")) {
    if (!token) return 0;
    try {
        const { exp } = jwtDecode<{ exp?: number }>(token);
        return typeof exp === "number" ? exp * 1000 - Date.now() : 0;
    } catch {
        return 0;
    }
}

/** Access is usable now, or a valid refresh token can recover the session. */
export const hasActiveSession = () =>
    msUntilTokenExpiry() > 0 || msUntilTokenExpiry(localStorage.getItem("refreshToken")) > 0;

let refreshPromise: Promise<string> | null = null;

/** Share one refresh across requests; use bare Axios to avoid interceptor loops. */
export function refreshAccessToken(): Promise<string> {
    if (refreshPromise) return refreshPromise;
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh || msUntilTokenExpiry(refresh) <= 0) {
        expireSession();
        return Promise.reject(new Error("Session expired"));
    }
    refreshPromise = (async () => {
        try {
            const response = await axios.post<{ access: string; refresh?: string }>(
                "/users/token/refresh/", { refresh },
                { baseURL: import.meta.env.VITE_API_BASE_URL, timeout: 15000 },
            );
            // A response arriving after logout or another login must not restore the old session.
            if (localStorage.getItem("refreshToken") !== refresh) {
                throw new Error("Session changed");
            }
            if (typeof response.data.access !== "string" || msUntilTokenExpiry(response.data.access) <= 0) {
                expireSession();
                throw new Error("Invalid refreshed access token");
            }
            localStorage.setItem("accessToken", response.data.access);
            if (response.data.refresh) localStorage.setItem("refreshToken", response.data.refresh);
            return response.data.access;
        } catch (error) {
            if (localStorage.getItem("refreshToken") === refresh && axios.isAxiosError(error)
                && [400, 401].includes(error.response?.status ?? 0)) {
                expireSession();
            }
            throw error;
        } finally {
            refreshPromise = null;
        }
    })();
    return refreshPromise;
}

/**
 * Refreshes on access expiry and tab wake-up. Temporary connection failures
 * keep the session and retry; invalid refresh credentials sign the user out.
 */
export function useSessionExpiryWatch() {
    useEffect(() => {
        let stopped = false;
        let timer: number | undefined;
        const check = async () => {
            window.clearTimeout(timer);
            try {
                if (msUntilTokenExpiry() <= 0) await refreshAccessToken();
            } catch {
                // A temporary connection failure should not discard the session.
            }
            if (!stopped) {
                const remaining = msUntilTokenExpiry();
                timer = window.setTimeout(() => void check(),
                    remaining > 0 ? Math.min(remaining + 500, 2_147_000_000) : 30_000);
            }
        };
        void check();
        const onVisible = () => {
            if (document.visibilityState === "visible") void check();
        };
        const onFocus = () => { void check(); };
        const onStorage = (event: StorageEvent) => {
            if (event.key === "accessToken" || event.key === "refreshToken" || event.key === null) void check();
        };
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("focus", onFocus);
        window.addEventListener("storage", onStorage);
        return () => {
            stopped = true;
            window.clearTimeout(timer);
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("storage", onStorage);
        };
    }, []);
}
