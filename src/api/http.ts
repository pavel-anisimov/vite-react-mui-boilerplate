import axios from "axios";

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
  baseURL: import.meta.env.VITE_API_URL, // take из .env.local
  withCredentials: true, // useful for refresh-cookie or CSRF
});

// === REQUEST INTERCEPTOR ===
http.interceptors.request.use(
  /**
   * Middleware function to attach an authorization token to the request headers.
   *
   * This function reads the access token from the local storage (or another potential store, e.g., Zustand in the future).
   * If the access token is found, it adds an `Authorization` header with `Bearer <token>`*/
  (config) => {
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
  /**
   * A function that directly returns the given response.
   *
   * @param {*} response - The input data to be returned as is.
   * @returns {*} - The same value provided as the input parameter.
   */
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
