// src/api/auth.ts
import http from "@/api/http";

export type LoginDto = { email: string; password: string };
export type Tokens = { accessToken: string; refreshToken: string };
export type User = { id: string; email: string; name?: string; roles?: string[] };

/**
 * Authenticates a user and retrieves authentication tokens.
 *
 * @param {LoginDto} dto - The login data transfer object containing user credentials.
 * @return {Promise<Tokens>} A promise that resolves with the authentication tokens.
 */
export async function login(dto: LoginDto): Promise<Tokens> {
  return http
    .post<Tokens>("/auth/login", dto)
    .then(({ data }) => data);
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
  return http
    .get<User>("/auth/me")
    .then(({ data }) => data);
}

/**
 * Refreshes the access token using the provided refresh token.
 *
 * @param {string} refreshToken - The refresh token used to obtain a new access*/
export async function refresh(refreshToken: string): Promise<{ accessToken: string }> {
  return http
    .post<{ accessToken: string }>("/auth/refresh", { refreshToken })
    .then(({ data }) => data);
}
