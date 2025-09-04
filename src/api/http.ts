import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosHeaders,
} from "axios";


const TOKENS_KEY = "auth.tokens";

export type Tokens = {
  accessToken: string;
  refreshToken?: string;
};

export function setAuthTokens(tokens: Tokens | null) {
  if (tokens) localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  else localStorage.removeItem(TOKENS_KEY);
}

export function getAccessToken(): string | null {
  const raw = localStorage.getItem(TOKENS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Tokens;
    return parsed.accessToken ?? null;
  } catch {
    return null;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

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
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true, // useful for refresh-cookie or CSRF
});

// === REQUEST INTERCEPTOR ===
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const { accessToken } = JSON.parse(raw) as { accessToken?: string };
        if (accessToken) {
          // Unify Headers → AxiosHeaders
          const headers = AxiosHeaders.from(config.headers);
          headers.set("Authorization", `Bearer ${accessToken}`);
          config.headers = headers;
        }
      } catch {
        // ignore bad JSON
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

http.interceptors.response.use(
  (response: AxiosResponse<unknown>): AxiosResponse<unknown> => response,

  // Here you can deploy/log/refresh - without any
  async (error: AxiosError<unknown>) => {
    // Example of a refresh blank:
    // if (error.response?.status === 401) {
    //   try {
    //     await refreshToken();
    //     return api.request(error.config as InternalAxiosRequestConfig<unknown>);
    //   } catch (_) {
    //     // if the refresh fails, we fall further
    //   }
    // }
    return Promise.reject(error);
  },
);


export default http;
