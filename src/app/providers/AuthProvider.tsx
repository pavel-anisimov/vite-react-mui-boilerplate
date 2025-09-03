// src/app/providers/AuthProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { login as apiLogin, me as apiMe } from "@/api/auth";

type User = { id: string; email: string; name?: string | null; roles?: string[] };

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken?: string) => void; // for refresh from the interceptor if desired
};

const AuthReactContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * The `AuthProvider` component is a React functional component that manages
 * authentication state and provides authentication-related functionality to its child components.
 * It makes use of React context to pass down authentication data and functions to deeply nested components.
 *
 * The component initializes and maintains the authentication state using React state and effects,
 * and manages:
 * - The authenticated user's information (`user`).
 * - The `accessToken` for API authorization.
 * - The `refreshToken` for renewing expired access tokens.
 * - The loading state (`isLoading`) that indicates the status of authentication initialization.
 *
 * This component persists authentication tokens in the `localStorage` and provides methods
 * for signing in, signing up (unimplemented), signing out, and manually updating tokens.
 *
 * Props:
 * - `children` - A React node that consumes the provided authentication context.
 *
 * Features:
 * - Initializes authentication state from `localStorage`.
 * - Handles user profile fetching if an access token is available.
 * - Persists tokens to `localStorage` and updates the state.
 * - Supports signing in a user by storing tokens and fetching the user's profile.
 * - Clears authentication state and storage upon signing out.
 * - Provides a placeholder for user registration (currently unimplemented).
 *
 * Context:
 * The component uses `AuthReactContext` to provide the following values to its children:
 * - `user`: The authenticated user object or `null` if not logged in.
 * - `accessToken`: The access token for API authorization or `null`.
 * - `isLoading`: A boolean indicating if the authentication state is being initialized.
 * - `signIn`: A method to log in a user with email and password.
 * - `signUp`: A method to register a user (throws a not-implemented error).
 * - `signOut`: A method to log out the user and clear authentication data.
 * - `setTokens`: A method to manually set and persist tokens.
 *
 * @param children
 * @constructor
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { accessToken?: string; refreshToken?: string };
        if (parsed.accessToken) setAccessToken(parsed.accessToken);
        if (parsed.refreshToken) setRefreshToken(parsed.refreshToken);
      } catch {
        // invalid JSON - let's clean it up just in case
        localStorage.removeItem("auth");
      }
    }

    (async () => {
      try {
        if (localStorage.getItem("auth")) {
          const u = await apiMe();
          setUser(u);
        }
      } catch {
        // token is invalid, leave logged out
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /**
   * A callback function that persists authentication tokens to localStorage and updates the
   * corresponding state variables. It stores the access token and optionally the refresh token
   * in the localStorage under the key "auth". If a new refresh token is provided, it updates the
   * refresh token state as well.
   *
   * Dependencies:
   * - Uses `localStorage.setItem` to store the serialized token object.
   * - Updates the state variables `accessToken` and `refreshToken` as needed.
   *
   * @function
   * @name persistTokens
   * @param {string} access - The access token to be stored and utilized.
   * @param {string} [refresh] - Optional refresh token to be stored and utilized.
   */
  const persistTokens = useCallback((access: string, refresh?: string) => {
    const next = {
      accessToken: access,
      refreshToken: refresh ?? refreshToken ?? null,
    };
    localStorage.setItem("auth", JSON.stringify(next));
    setAccessToken(next.accessToken);
    if (refresh ?? null) setRefreshToken(refresh!);
  }, [refreshToken]);

  /**
   * A callback function to persist authentication tokens.
   *
   * @function
   * @name setTokens
   * @param {string} access - The access token to be persisted.
   * @param {string} [refresh] - The optional refresh token to be persisted.
   */
  const setTokens = useCallback((access: string, refresh?: string) => {
    persistTokens(access, refresh);
  }, [persistTokens]);

  /**
   * A callback function to handle user sign-in functionality.
   * This asynchronous function authenticates a user with the provided email
   * and password by using an API login endpoint. Upon successful authentication,
   * access and refresh tokens are persisted, and the user's data is fetched
   * and stored using the `setUser` function.
   *
   * Dependencies:
   * - persistTokens: A function to save the tokens securely.
   * - setUser: A function to update the application state with user data.
   *
   * This function relies on the `persistTokens` dependency and
   * reinitializes when `persistTokens` changes.
   *
   * @param {string} email - The email address of the user attempting to sign in.
   * @param {string} password - The password associated with the provided email address.
   * @returns {Promise<void>} Resolves once the sign-in process is completed.
   */
  const signIn = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken } = await apiLogin({ email, password });
    persistTokens(accessToken, refreshToken);
    const u = await apiMe();
    setUser(u);
  }, [persistTokens]);

  /**
   * Asynchronous callback function for initiating the user registration process.
   *
   * This function is designed to handle the sign-up process by taking an email,
   * password, and an optional name as parameters. However, the implementation
   * is currently incomplete and will throw an error when invoked. It is intended
   * to integrate with the API-Gateway in the future for user registration functionality.
   *
   * The function is memoized using `useCallback` to optimize performance and prevent
   * unnecessary re-creation upon re-renders.
   *
   * @param {string} _email - The email address used for registration.
   * @param {string} _password - The password associated with the user's account.
   * @param {string} [_name] - An optional name for the user.
   * @throws {Error} Throws an error indicating registration is not yet implemented.
   */
  const signUp = useCallback(async (_email: string, _password: string, _name?: string) => {
    throw new Error("Registration is not implemented yet on API-Gateway");
  }, []);

  /**
   * signOut is a callback function responsible for handling the user sign-out process.
   * It performs the following actions:
   * - Removes the authentication information stored in the browser's localStorage.
   * - Updates the application state by setting the user, access token, and refresh token to null.
   *
   * This function ensures that all user-specific data is cleared upon sign-out,
   * maintaining the security and integrity of the application.
   */
  const signOut = useCallback(async () => {
    localStorage.removeItem("auth");
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  /**
   * Memoized value for the authentication context.
   *
   * This object contains properties and methods related to user authentication,
   * ensuring efficiency by recomputing only when specified dependencies change.
   *
   * Dependencies:
   * - user: The current authenticated user.
   * - accessToken: The token used for API authentication.
   * - isLoading: A boolean indicating if an authentication-related process is in progress.
   * - signIn: A method to handle user sign-in.
   * - signUp: A method to handle user sign-up.
   * - signOut: A method to handle user logout.
   * - setTokens: A method to update authentication tokens.
   */
  const value = useMemo<AuthContextValue>(() => ({
    user,
    accessToken,
    isLoading,
    signIn,
    signUp,
    signOut,
    setTokens,
  }), [user, accessToken, isLoading, signIn, signUp, signOut, setTokens]);

  return <AuthReactContext.Provider value={value}>{children}</AuthReactContext.Provider>;
};

/**
 * Custom hook to access the authentication context.
 *
 * This hook retrieves the authentication context from the AuthReactContext.
 * It ensures that the hook is used within the appropriate context provider (AuthProvider).
 * If used outside of the context provider, it will throw an error.
 *
 * @returns {Object} The authentication context value.
 * @throws {Error} Throws an error if the hook is not used within AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthReactContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
