import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { showGlobalError } from "./errorDialogService";
import { formatValidationErrors } from "../utils/errorUtils";
import { expireSession } from "./session";
import { invalidateAfterMutation } from "./queryClient";

declare module "axios" {
    export interface AxiosRequestConfig {
        suppressGlobalError?: boolean;
    }
}

type JwtPayload = {
    exp?: number;
};

const api = axios.create({

    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const authEndpointPattern = /\/users\/(login|forgot_password|reset_password)\/?$/;

const isAuthEndpoint = (url?: string) =>
    typeof url === "string" && authEndpointPattern.test(url);

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token && !isAuthEndpoint(config.url)) {
            if (isTokenExpired(token)) {
                expireSession();
                return Promise.reject(new Error("Token expired"));
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toLowerCase();
        if (
            method && method !== "get" && method !== "head" &&
            !isAuthEndpoint(response.config.url)
        ) {
            // Data changed on the server: refresh cached lists in the background.
            invalidateAfterMutation(response.config.url);
        }
        return response;
    },
    (error) => {
        if (isAuthEndpoint(error.config?.url)) {
            return Promise.reject(error);
        }

        if (error.code === "ERR_CANCELED") {
            // Request aborted (page left / filters changed): not an error.
            return Promise.reject(error);
        }

        const status: number | null = error.response ? error.response.status : null;
        const method = String(error.config?.method ?? "get").toLowerCase();
        const isRead = method === "get" || method === "head";

        // Forms that render field-level validation opt out of the 400 dialog
        // only, avoiding duplicate feedback while retaining shared handling
        // for permission, server, and connection failures.
        const suppressValidationDialog =
            status === 400 && error.config?.suppressGlobalError;

        if (status === 401) {
            expireSession();
            return Promise.reject(error);
        }

        // Bad requests carry an API-authored explanation (often a validation
        // or business-rule message). Show it so users know what to correct.
        if (status === 400) {
            if (!suppressValidationDialog) {
                showGlobalError(
                    formatValidationErrors(error.response.data),
                    clientErrorTitle(status),
                );
            }
            return Promise.reject(error);
        }

        // Other client errors: explain in a dialog and stay on the page, so
        // nothing the user typed is lost.
        if (status !== null && status >= 402 && status <= 499) {
            showGlobalError(
                formatValidationErrors(error.response.data),
                clientErrorTitle(status),
            );
            return Promise.reject(error);
        }

        const isServerError = status !== null && status >= 500;
        const isConnectionError = !error.response && Boolean(error.request);

        // A failed save keeps the user on the form with a message.
        if ((isServerError || isConnectionError) && !isRead) {
            showGlobalError(
                isConnectionError
                    ? "We could not reach the server. Check your connection and try again; your changes are still here."
                    : "The server could not complete this action. Please try again in a moment; your changes are still here.",
                isConnectionError ? "Connection problem" : "Something went wrong",
            );
            return Promise.reject(error);
        }

        // A page that cannot load its data shows the full error page.
        if (isServerError || isConnectionError) {
            const basePath = import.meta.env.BASE_URL.endsWith("/")
                ? import.meta.env.BASE_URL
                : `${import.meta.env.BASE_URL}/`;
            const errorPath = `${basePath}error/${isConnectionError ? "network" : status}`;
            const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
            const returnTo = currentLocation.startsWith(basePath)
                ? currentLocation.slice(basePath.length - 1)
                : currentLocation;

            if (window.location.pathname !== errorPath) {
                window.location.assign(`${errorPath}?returnTo=${encodeURIComponent(returnTo)}`);
            }
        }

        return Promise.reject(error);
    }
);

function clientErrorTitle(status: number) {
    if (status === 400) return "Please check your information";
    if (status === 403) return "Permission denied";
    if (status === 404) return "Not found";
    if (status === 409) return "Conflict";
    if (status === 422) return "Validation error";
    if (status === 429) return "Too many requests";
    return "Request could not be completed";
}

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000;
        return typeof decoded.exp !== "number" || decoded.exp < currentTime;
    } catch {
        return true;
    }
}

export default api;
