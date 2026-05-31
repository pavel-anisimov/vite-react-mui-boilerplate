import http from "@/api/http";

export type UserStatus = "active" | "blocked" | "pending_verification" | "suspended";

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  first_name: string;
  last_name: string;
  status: UserStatus;
  status_changed_at: string;
  status_changed_by: string;
  email_verified: boolean;
  email_verified_at: string | null;
  roles: string[];
  tenant_id: string;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  security: {
    two_factor_enabled: boolean;
    failed_login_count: number;
    last_failed_login_at: string | null;
    password_updated_at: string;
    locked_until: string | null;
  };
  profile: {
    gender: string;
    date_of_birth: string;
    location: {
      city: string;
      state: string;
      country: string;
      zip: string;
    };
    language: string;
    timezone: string;
    avatar_url: string;
    bio: string;
    social: Record<string, string | null>;
    phone_number: string;
    phone_verified: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: {
      email: boolean;
      sms: boolean;
      marketing: boolean;
    };
    privacy: Record<string, string>;
  };
  metadata: {
    signup_ip: string;
    last_login_ip: string;
    login_count: number;
    user_agent: string;
  };
  external_ids: Record<string, string | null>;
  auth_provider: string;
  terms_version: string;
  terms_accepted_at: string;
  privacy_accepted_at: string;
  feature_gates: string[];
};

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
