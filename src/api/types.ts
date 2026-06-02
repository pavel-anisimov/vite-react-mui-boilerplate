export type UserStatus =
  | "active"
  | "blocked"
  | "pending"
  | "pending_verification"
  | "suspended"
  | "deactivated"
  | "deleted";

export type User = {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  status?: UserStatus;
  deleted?: boolean;
  deleted_at?: string | null;
  emailVerified?: boolean;
  email_verified?: boolean;
  roles?: string[];
  is_deleted?: boolean;
  suspended?: boolean;
  is_suspended?: boolean;
};

export type PublicUserProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  public_location: {
    city: string | null;
    country: string | null;
  } | null;
  public_social: {
    linkedin: string | null;
    github: string | null;
    x: string | null;
    website: string | null;
  };
  badges: string[];
  member_since: string;
  last_seen_at: string | null;
  profile_visibility: "public" | "private";
};

export type AdminUserProfile = User & {
  username: string;
  display_name: string;
  first_name: string;
  last_name: string;
  status: UserStatus;
  deleted: boolean;
  deleted_at: string | null;
  status_changed_at: string | null;
  status_changed_by: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  roles: string[];
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  security: {
    two_factor_enabled: boolean;
    failed_login_count: number;
    last_failed_login_at: string | null;
    password_updated_at: string | null;
    locked_until: string | null;
  };
  profile: {
    gender: string | null;
    date_of_birth: string | null;
    location: {
      city: string | null;
      state: string | null;
      country: string | null;
      zip: string | null;
    };
    language: string | null;
    timezone: string | null;
    avatar_url: string | null;
    bio: string | null;
    social: Record<string, string | null>;
    phone_number: string | null;
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
    signup_ip: string | null;
    last_login_ip: string | null;
    login_count: number;
    user_agent: string | null;
  };
  external_ids: Record<string, string | null>;
  auth_provider: "password" | "google" | "github" | string;
  terms_version: string | null;
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
  feature_gates: string[];
};

export type OwnUserProfile = AdminUserProfile;
export type UserProfile = AdminUserProfile;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type AuthLoginPayload = {
  email: string;
  password: string;
};

export type AuthLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type AuthRefreshResponse = {
  accessToken: string;
};
