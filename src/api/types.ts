export type UserStatus = "active" | "blocked" | "pending_verification" | "suspended" | "deleted";

export type User = {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  status?: UserStatus;
  emailVerified?: boolean;
  email_verified?: boolean;
  roles?: string[];
  deleted?: boolean;
  is_deleted?: boolean;
  suspended?: boolean;
  is_suspended?: boolean;
};

export type UserProfile = User & {
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
