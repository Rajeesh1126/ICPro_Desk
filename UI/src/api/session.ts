import { useEffect } from "react";
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

/** True when a usable (present and unexpired) session exists. */
export const hasActiveSession = () => msUntilTokenExpiry() > 0;

/**
 * Signs the user out the moment their token expires, instead of waiting for
 * the next request to fail. Browsers throttle timers in background tabs, so
 * the check also runs whenever the tab becomes visible or focused again.
 */
export function useSessionExpiryWatch() {
    useEffect(() => {
        const check = () => {
            if (msUntilTokenExpiry() <= 0) expireSession();
        };
        const remaining = msUntilTokenExpiry();
        if (remaining <= 0) {
            check();
            return;
        }
        // setTimeout overflows above ~24.8 days; cap and re-check on wake.
        const timer = window.setTimeout(check, Math.min(remaining + 500, 2_147_000_000));
        const onVisible = () => {
            if (document.visibilityState === "visible") check();
        };
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("focus", check);
        return () => {
            window.clearTimeout(timer);
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("focus", check);
        };
    }, []);
}
