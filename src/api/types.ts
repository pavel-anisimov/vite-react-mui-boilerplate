export type UserStatus = "active" | "pending" | "pending_verification" | "suspended" | "deactivated" | "deleted";

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
  /** False until the user fills in the required profile basics (displayName). Absent on older backends. */
  profileCompleted?: boolean;
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

export type MyProfileLocation = {
  city: string | null;
  state: string | null;
  country: string | null;
  zip: string | null;
};

/** User-editable profile data owned by the Python service, adapted by the gateway (camelCase). */
export type MyProfileData = {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  location: MyProfileLocation;
  language: string | null;
  timezone: string | null;
};

/** Response of GET/PATCH /auth/me/profile. */
export type MyProfile = {
  id: string | number;
  email: string;
  profileCompleted: boolean;
  profile: MyProfileData;
};

/** PATCH /auth/me/profile payload — all fields optional, camelCase. */
export type UpdateMyProfilePayload = {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  location?: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zip?: string | null;
  };
  language?: string | null;
  timezone?: string | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

/** The authenticated user returned by the gateway (login response / GET /auth/me). */
export type CurrentUser = User;

/** Shared acknowledgement shape returned by gateway auth endpoints. */
export type MessageResponse = {
  ok: true;
  message: string;
};

/** Error body the gateway may return on auth failures. */
export type ApiErrorBody = {
  error?: string;
  message?: string;
  detail?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
};

export type RegisterResponse = MessageResponse;

export type VerifyEmailResponse = MessageResponse;

export type ResendVerificationPayload = {
  email: string;
};

export type ResendVerificationResponse = MessageResponse;

export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = MessageResponse;

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export type ResetPasswordResponse = MessageResponse;

export type RefreshPayload = {
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  tokenType: "bearer";
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: "bearer";
  user: CurrentUser;
};

/** @deprecated Use LoginPayload. */
export type AuthLoginPayload = LoginPayload;
/** @deprecated Use LoginResponse. */
export type AuthLoginResponse = LoginResponse;

/** @deprecated Use RefreshResponse. */
export type AuthRefreshResponse = RefreshResponse;
