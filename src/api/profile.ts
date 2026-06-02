import http from "@/api/http";

import type { UserProfile, UserStatus } from "@/api/types";

export type { UserProfile, UserStatus };

export type UpdateMyProfilePayload = {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  profile?: {
    gender?: string;
    date_of_birth?: string | null;
    location?: {
      city?: string;
      state?: string;
      country?: string;
      zip?: string;
    };
    language?: string;
    timezone?: string;
    avatar_url?: string;
    bio?: string;
    social?: Record<string, string | null>;
    phone_number?: string;
  };
  preferences?: {
    theme?: "light" | "dark" | "system";
    notifications?: {
      email?: boolean;
      sms?: boolean;
      marketing?: boolean;
    };
    privacy?: {
      email?: string;
    };
  };
};

export async function getUserProfile(userId: string): Promise<UserProfile> {
  return http.get<UserProfile>(`/users/${encodeURIComponent(userId)}/profile`).then(({ data }) => data);
}

export async function getMyProfile(): Promise<UserProfile> {
  return http.get<UserProfile>("/auth/me").then(({ data }) => data);
}

export async function updateMyProfile(payload: UpdateMyProfilePayload): Promise<UserProfile> {
  return http.patch<UserProfile>("/auth/me/profile", payload).then(({ data }) => data);
}

export async function deleteMyAccount(userId: string): Promise<UserProfile> {
  return http.patch<UserProfile>(`/users/${encodeURIComponent(userId)}/deleted`, { deleted: true }).then(({ data }) => data);
}
