import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // take из .env.local
  withCredentials: true, // useful for refresh-cookie or CSRF
});

// === REQUEST INTERCEPTOR ===
http.interceptors.request.use((config) => {
  // read the token from localStorage (or later - from the zustand store)
  const raw = localStorage.getItem("auth");
  if (raw) {
    const { accessToken } = JSON.parse(raw);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// === RESPONSE INTERCEPTOR (401 → refresh) ===
let isRefreshing = false;
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401 && !isRefreshing) {
      try {
        isRefreshing = true;
        const raw = localStorage.getItem("auth");
        const { refreshToken } = raw ? JSON.parse(raw) : {};

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // direct query to avoid interceptors recursively
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );

        // update stored accessToken
        localStorage.setItem(
          "auth",
          JSON.stringify({ ...JSON.parse(raw || "{}"), accessToken: data.accessToken })
        );

        isRefreshing = false;

        // repeat the original request
        return http(error.config);
      } catch (e) {
        isRefreshing = false;
        localStorage.removeItem("auth");
        // optional: redirect to /login
      }
    }
    return Promise.reject(error);
  }
);

export default http;
