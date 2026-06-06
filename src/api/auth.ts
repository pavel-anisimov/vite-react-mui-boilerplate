// src/api/auth.ts
import http from "@/api/http";

import type {
  AuthRefreshResponse,
  CurrentUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  User,
} from "@/api/types";

export type LoginDto = LoginPayload;
export type Tokens = Pick<LoginResponse, "accessToken" | "refreshToken">;
export type { AuthRefreshResponse, CurrentUser, LoginPayload, LoginResponse, RegisterPayload, RegisterResponse, User };

/**
 * Registers a new user account.
 *
 * The gateway accepts the registration and sends a verification email.
 * No tokens or user payload are returned — the user must verify their
 * email and then sign in explicitly.
 *
 * @param {RegisterPayload} dto - The registration credentials (email, password).
 * @return {Promise<RegisterResponse>} A promise that resolves with the acknowledgement message.
 */
export async function register(dto: RegisterPayload): Promise<RegisterResponse> {
  return http.post<RegisterResponse>("/auth/register", dto).then(({ data }) => data);
}

/**
 * Authenticates a user and retrieves authentication tokens.
 *
 * @param {LoginDto} dto - The login data transfer object containing user credentials.
 * @return {Promise<LoginResponse>} A promise that resolves with tokens and the login user payload.
 */
export async function login(dto: LoginPayload): Promise<LoginResponse> {
  return http.post<LoginResponse>("/auth/login", dto).then(({ data }) => data);
}

/**
 * Fetches the authenticated user's information.
 *
 * This method sends a GET request to the "/auth/me" endpoint
 * and retrieves the details of the currently authenticated user.
 *
 * @return {Promise<User>} A promise that resolves to the user's information.
 */
export async function me(): Promise<User> {
  return http.get<User>("/auth/me").then(({ data }) => data);
}

/**
 * Refreshes the access token using the provided refresh token.
 *
 * @param {string} refreshToken - The refresh token used to get new access
 * */
export async function refresh(refreshToken: string): Promise<AuthRefreshResponse> {
  return http.post<AuthRefreshResponse>("/auth/refresh", { refreshToken }).then(({ data }) => data);
}

/**
 * Logs out the current authenticated session.
 *
 * @return {Promise<void>} A promise that resolves after the gateway acknowledges logout.
 */
export async function logout(): Promise<void> {
  await http.post<void>("/auth/logout");
}
