// src/api/auth.ts
import http from "@/api/http";

export type LoginDto = { email: string; password: string };
export type Tokens = { accessToken: string; refreshToken: string };
export type User = { id: string; email: string; name?: string; roles?: string[] };

export async function login(dto: LoginDto): Promise<Tokens> {
  return http
    .post<Tokens>("/auth/login", dto)
    .then(({ data }) => data);
}

export async function me(): Promise<User> {
  return http
    .get<User>("/auth/me")
    .then(({ data }) => data);
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string }> {
  return http
    .post<{ accessToken: string }>("/auth/refresh", { refreshToken })
    .then(({ data }) => data);
}
