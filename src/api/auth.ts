// src/api/auth.ts
import http from "@/api/http";

import type {
  AuthRefreshResponse,
  CurrentUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResendVerificationPayload,
  ResendVerificationResponse,
  User,
  VerifyEmailResponse,
} from "@/api/types";

export type LoginDto = LoginPayload;
export type Tokens = Pick<LoginResponse, "accessToken" | "refreshToken">;
export type {
  AuthRefreshResponse,
  CurrentUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResendVerificationPayload,
  ResendVerificationResponse,
  User,
  VerifyEmailResponse,
};

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
 * Verifies a user's email address using the token from the verification link.
 *
 * Verification does not log the user in — after a successful call the user
 * still has to sign in explicitly.
 *
 * @param {string} token - The verification token from the emailed link.
 * @return {Promise<VerifyEmailResponse>} A promise that resolves with the acknowledgement message.
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  return http.get<VerifyEmailResponse>("/auth/verify", { params: { token } }).then(({ data }) => data);
}

/**
 * Requests a new verification email.
 *
 * The gateway responds with the same neutral message whether or not the
 * account exists, so the response must be shown as-is.
 *
 * @param {ResendVerificationPayload} dto - The email to resend the verification link to.
 * @return {Promise<ResendVerificationResponse>} A promise that resolves with the acknowledgement message.
 */
export async function resendVerification(dto: ResendVerificationPayload): Promise<ResendVerificationResponse> {
  return http.post<ResendVerificationResponse>("/auth/resend-verification", dto).then(({ data }) => data);
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
