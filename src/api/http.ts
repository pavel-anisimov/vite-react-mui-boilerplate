import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosError, AxiosHeaders } from "axios";

import type { RefreshResponse } from "@/api/types";

const TOKENS_KEY = "auth.tokens";
const LEGACY_TOKENS_KEY = "auth";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export type Tokens = {
  accessToken: string;
  refreshToken?: string;
};

export function setAuthTokens(tokens: Tokens | null) {
  if (tokens) {
    const payload: Tokens = tokens.refreshToken
      ? { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
      : { accessToken: tokens.accessToken };
    localStorage.setItem(TOKENS_KEY, JSON.stringify(payload));
    localStorage.removeItem(LEGACY_TOKENS_KEY);
  } else {
    localStorage.removeItem(TOKENS_KEY);
    localStorage.removeItem(LEGACY_TOKENS_KEY);
  }
}

export function getAuthTokens(): Tokens | null {
  return readTokens(TOKENS_KEY) ?? readTokens(LEGACY_TOKENS_KEY);
}

export function getAccessToken(): string | null {
  return getAuthTokens()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getAuthTokens()?.refreshToken ?? null;
}

function readTokens(key: string): Tokens | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || typeof parsed.accessToken !== "string") {
      return null;
    }

    return typeof parsed.refreshToken === "string"
      ? { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken }
      : { accessToken: parsed.accessToken };
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * An Axios instance pre-configured with custom settings for making HTTP requests.
 *
 * This instance is set up to:
 * - Automatically use the base URL specified in the environment variable `VITE_API_URL`.
 * - Include credentials such as cookies and authentication headers with requests,
 *   which can assist in handling scenarios like refreshing cookies or dealing with CSRF tokens.
 *
 * The `http` instance can be used to perform various HTTP operations such as GET, POST, PUT, DELETE, etc.
 */
const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // useful for refresh-cookie or CSRF
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

// === REQUEST INTERCEPTOR ===
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = getAccessToken();
    if (accessToken) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set("Authorization", `Bearer ${accessToken}`);
      config.headers = headers;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

http.interceptors.response.use(
  (response: AxiosResponse<unknown>): AxiosResponse<unknown> => response,

  async (error: AxiosError<unknown>) => {
    const originalConfig = error.config as RetriableRequestConfig | undefined;
    const refreshToken = getRefreshToken();
    const requestUrl = originalConfig?.url ?? "";

    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retry &&
      refreshToken &&
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/refresh")
    ) {
      originalConfig._retry = true;

      try {
        const { data } = await axios.post<RefreshResponse>(
          "/auth/refresh",
          { refreshToken },
          { baseURL: API_BASE_URL, withCredentials: true },
        );
        setAuthTokens({ accessToken: data.accessToken, refreshToken });

        const headers = AxiosHeaders.from(originalConfig.headers);
        headers.set("Authorization", `Bearer ${data.accessToken}`);
        originalConfig.headers = headers;

        return http.request(originalConfig);
      } catch {
        setAuthTokens(null);
      }
    }

    return Promise.reject(error);
  },
);

export default http;
