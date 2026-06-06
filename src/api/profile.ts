import http from "@/api/http";

import type { AdminUserProfile, OwnUserProfile, PublicUserProfile, UserProfile, UserStatus } from "@/api/types";

export type { AdminUserProfile, OwnUserProfile, PublicUserProfile, UserProfile, UserStatus };

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

export async function getCurrentUserProfile(): Promise<OwnUserProfile> {
  return http.get<OwnUserProfile>("/auth/me").then(({ data }) => data);
}

export async function updateCurrentUserProfile(payload: UpdateMyProfilePayload): Promise<OwnUserProfile> {
  return http.patch<OwnUserProfile>("/auth/me/profile", payload).then(({ data }) => data);
}

export async function getPublicUserProfile(userId: string): Promise<PublicUserProfile> {
  return http.get<PublicUserProfile>(`/users/${encodeURIComponent(userId)}/public`).then(({ data }) => data);
}

export async function getAdminUserProfile(userId: string): Promise<AdminUserProfile> {
  return http.get<AdminUserProfile>(`/users/${encodeURIComponent(userId)}/profile`).then(({ data }) => data);
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  return getAdminUserProfile(userId);
}

export async function getMyProfile(): Promise<OwnUserProfile> {
  return getCurrentUserProfile();
}

export async function updateMyProfile(payload: UpdateMyProfilePayload): Promise<OwnUserProfile> {
  return updateCurrentUserProfile(payload);
}

export async function deleteMyAccount(userId: string): Promise<UserProfile> {
  return http
    .patch<UserProfile>(`/users/${encodeURIComponent(userId)}/deleted`, { deleted: true })
    .then(({ data }) => data);
}
