import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { showGlobalError } from "./ErrorDialogService";
import { formatValidationErrors } from "../utils/errorUtils";

type JwtPayload = {
    exp?: number;
};

const api = axios.create({

    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        
        if (token) {
            if (isTokenExpired(token)) {
                localStorage.clear();

                window.location.replace(import.meta.env.BASE_URL);

                return Promise.reject(new Error("Token expired"));
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(error);
        const status = error.response ? error.response.status : null;
        if (status === 404) {
            // retuen the error response data to the calling function for handling validation errors
            showGlobalError(
                formatValidationErrors(error.response.data),
                "Validation Error"
            );
        }

        const isHttpError = typeof status === "number" && status >= 402 && status <= 599;
        const isConnectionError = !error.response && Boolean(error.request) && error.code !== "ERR_CANCELED";

        if (isHttpError || isConnectionError) {
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


