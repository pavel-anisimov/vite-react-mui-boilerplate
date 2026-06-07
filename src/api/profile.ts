import http from "@/api/http";

import type {
  AdminUserProfile,
  MyProfile,
  MyProfileData,
  MyProfileLocation,
  OwnUserProfile,
  PublicUserProfile,
  UpdateMyProfilePayload,
  UserProfile,
  UserStatus,
} from "@/api/types";

export type {
  AdminUserProfile,
  MyProfile,
  MyProfileData,
  MyProfileLocation,
  OwnUserProfile,
  PublicUserProfile,
  UpdateMyProfilePayload,
  UserProfile,
  UserStatus,
};

/**
 * @deprecated Old snake_case payload kept for the legacy full-profile page
 * (admin view). New code must use UpdateMyProfilePayload (camelCase).
 */
export type LegacyUpdateProfilePayload = {
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

/** @deprecated Legacy snake_case update kept for the old full-profile page. Use updateMyProfile. */
export async function updateCurrentUserProfile(payload: LegacyUpdateProfilePayload): Promise<OwnUserProfile> {
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

/**
 * Fetches the current user's editable profile (camelCase gateway contract).
 */
export async function getMyProfile(): Promise<MyProfile> {
  return http.get<MyProfile>("/auth/me/profile").then(({ data }) => data);
}

/**
 * Partially updates the current user's editable profile.
 * The gateway responds with the same shape as GET /auth/me/profile.
 */
export async function updateMyProfile(payload: UpdateMyProfilePayload): Promise<MyProfile> {
  return http.patch<MyProfile>("/auth/me/profile", payload).then(({ data }) => data);
}

export async function deleteMyAccount(userId: string): Promise<UserProfile> {
  return http
    .patch<UserProfile>(`/users/${encodeURIComponent(userId)}/deleted`, { deleted: true })
    .then(({ data }) => data);
}
