// src/api/auth.ts
import http from "@/api/http";

import type {
  CurrentUser,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  LoginResponse,
  RefreshPayload,
  RefreshResponse,
  RegisterPayload,
  RegisterResponse,
  ResendVerificationPayload,
  ResendVerificationResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  User,
  VerifyEmailResponse,
} from "@/api/types";

export type LoginDto = LoginPayload;
export type Tokens = Pick<LoginResponse, "accessToken" | "refreshToken">;
export type {
  CurrentUser,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  LoginResponse,
  RefreshPayload,
  RefreshResponse,
  RegisterPayload,
  RegisterResponse,
  ResendVerificationPayload,
  ResendVerificationResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
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
 * Requests a password reset email.
 *
 * The gateway responds with the same neutral message whether or not the
 * account exists, so the response must be shown as-is.
 *
 * @param {ForgotPasswordPayload} dto - The email to send the reset link to.
 * @return {Promise<ForgotPasswordResponse>} A promise that resolves with the acknowledgement message.
 */
export async function forgotPassword(dto: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
  return http.post<ForgotPasswordResponse>("/auth/forgot-password", dto).then(({ data }) => data);
}

/**
 * Resets the user's password using the token from the reset link.
 *
 * Resetting does not log the user in — after a successful call the user
 * still has to sign in explicitly.
 *
 * @param {ResetPasswordPayload} dto - The reset token and the new password.
 * @return {Promise<ResetPasswordResponse>} A promise that resolves with the acknowledgement message.
 */
export async function resetPassword(dto: ResetPasswordPayload): Promise<ResetPasswordResponse> {
  return http.post<ResetPasswordResponse>("/auth/reset-password", dto).then(({ data }) => data);
}

/**
 * Refreshes the access token using the provided refresh token.
 *
 * Only a new access token is returned — the refresh token stays the same.
 *
 * @param {RefreshPayload} dto - The refresh token used to get a new access token.
 * @return {Promise<RefreshResponse>} A promise that resolves with the new access token.
 */
export async function refreshAccessToken(dto: RefreshPayload): Promise<RefreshResponse> {
  return http.post<RefreshResponse>("/auth/refresh", dto).then(({ data }) => data);
}

/**
 * Logs out the current authenticated session.
 *
 * @return {Promise<void>} A promise that resolves after the gateway acknowledges logout.
 */
export async function logout(): Promise<void> {
  await http.post<void>("/auth/logout");
}
