import {
  AccountCircleOutlined,
  BadgeOutlined,
  CalendarMonthOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlineOutlined,
  EmailOutlined,
  EditOutlined,
  FingerprintOutlined,
  GppMaybeOutlined,
  KeyOutlined,
  LanguageOutlined,
  LinkOutlined,
  LocationOnOutlined,
  LockOutlined,
  LoginOutlined,
  MarkEmailUnreadOutlined,
  PhoneOutlined,
  PolicyOutlined,
  PublicOutlined,
  SaveOutlined,
  ShieldOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { deleteMyAccount, getMyProfile, getUserProfile, updateMyProfile } from "@/api/profile";
import PageContainer from "@/components/PageContainer";
import ControlledTextField from "@/components/form/ControlledTextField";
import { LANG_LABELS, SUPPORTED_LANGS } from "@/i18n/langConfig";
import { formatTimezoneLabel, TIMEZONE_OPTIONS } from "@/utils/timezones";

import { useEffect, useState } from "react";

import type { JSX, ReactNode } from "react";
import type { TFunction } from "i18next";
import type { UseFormReturn } from "react-hook-form";
import type { UpdateMyProfilePayload, UserProfile, UserStatus } from "@/api/profile";

type GenderValue = "" | "male" | "female" | "other" | "prefer_not_to_say";
type PreferredLanguageValue = "" | "en" | "ru" | "pl";

type ProfileFormValues = {
  display_name: string;
  first_name: string;
  last_name: string;
  gender: GenderValue;
  date_of_birth: string;
  bio: string;
  language: PreferredLanguageValue;
  timezone: string;
  avatar_url: string;
  phone_number: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  linkedin: string;
  theme: "light" | "dark" | "system";
  notify_email: boolean;
  notify_sms: boolean;
  notify_marketing: boolean;
  email_privacy: string;
};

const EMPTY_FORM_VALUES: ProfileFormValues = {
  display_name: "",
  first_name: "",
  last_name: "",
  gender: "",
  date_of_birth: "",
  bio: "",
  language: "",
  timezone: "",
  avatar_url: "",
  phone_number: "",
  city: "",
  state: "",
  country: "",
  zip: "",
  linkedin: "",
  theme: "system",
  notify_email: false,
  notify_sms: false,
  notify_marketing: false,
  email_privacy: "private",
};

export default function Profile(): JSX.Element {
  const { t } = useTranslation("common");
  const { refreshUser, signOut, user: authUser } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const authRoles = (authUser?.roles ?? []).map((role) => role.toLowerCase());
  const isAdmin = authRoles.includes("admin");
  const isOwnProfile = !userId;
  const requestedUserId = userId ?? authUser?.id;
  const canViewRequestedProfile = isOwnProfile || Boolean(userId && isAdmin);
  const canEditProfile = isOwnProfile;
  const form = useForm<ProfileFormValues>({
    defaultValues: EMPTY_FORM_VALUES,
  });

  const {
    data,
    error,
    isError,
    isFetching,
  } = useQuery({
    queryKey: isOwnProfile ? ["user-profile", "me"] : ["user-profile", requestedUserId],
    queryFn: () => (isOwnProfile ? getMyProfile() : getUserProfile(requestedUserId!)),
    enabled: canViewRequestedProfile,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["user-profile", "me"], updatedProfile);
      void refreshUser().catch(() => undefined);
      form.reset(toProfileFormValues(updatedProfile));
      setEditMode(false);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: async () => {
      setDeleteDialogOpen(false);
      await signOut();
      await navigate("/auth/sign-in");
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(toProfileFormValues(data));
    }
  }, [data, form]);

  const handleCancelEdit = () => {
    if (data) {
      form.reset(toProfileFormValues(data));
    }
    setEditMode(false);
  };

  const handleSubmitProfile = (values: ProfileFormValues) => {
    updateMutation.mutate(toUpdateMyProfilePayload(values));
  };

  const handleDeleteAccount = () => {
    if (data?.id) {
      deleteAccountMutation.mutate(data.id);
    }
  };

  if (!canViewRequestedProfile) {
    return <Navigate to="/" replace state={{ forbidden: true }} />;
  }

  if (!data) {
    return (
      <PageContainer>
        <Stack spacing={2}>
          {isError && (
            <Alert severity="error">
              {(error as Error)?.message ?? t("profile.errors.load")}
            </Alert>
          )}
          {isFetching && (
            <Alert severity="info">
              {isOwnProfile
                ? t("profile.loadingOwn")
                : t("profile.loadingUser", { userId: requestedUserId })}
            </Alert>
          )}
        </Stack>
      </PageContainer>
    );
  }

  const user = data;
  const missingFields = getMissingProfileFields(user);
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  const location = [
    user.profile?.location?.city,
    user.profile?.location?.state,
    user.profile?.location?.country,
    user.profile?.location?.zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <PageContainer>
      <Stack spacing={3}>
        {isError && (
          <Alert severity="error">
            {(error as Error)?.message ?? t("profile.errors.load")}
          </Alert>
        )}

        {updateMutation.isError && (
          <Alert severity="error">
            {(updateMutation.error as Error)?.message ?? t("profile.errors.update")}
          </Alert>
        )}

        {deleteAccountMutation.isError && (
          <Alert severity="error">
            {(deleteAccountMutation.error as Error)?.message ?? t("profile.errors.deleteAccount")}
          </Alert>
        )}

        {isFetching && (
          <Alert severity="info">
            {isOwnProfile
              ? t("profile.loadingOwn")
              : t("profile.loadingUser", { userId: requestedUserId })}
          </Alert>
        )}

        {missingFields.length > 0 && (
          <Alert severity="warning">
            {t("profile.incomplete", { fields: missingFields.join(", ") })}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
            >
              <Avatar
                sx={{
                  width: 88,
                  height: 88,
                  bgcolor: "primary.main",
                  fontSize: 32,
                  fontWeight: 700,
                }}
              >
                {initials(fullName || user.email || user.id)}
              </Avatar>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.75 }}
                >
                  <Typography variant="h4" sx={{ wordBreak: "break-word" }}>
                    {user.display_name || fullName || user.email || t("profile.title")}
                  </Typography>
                  <StatusChip status={user.status} />
                  {user.email_verified ? (
                    <Chip size="small" color="success" icon={<CheckCircleOutlined />} label={t("profile.values.emailVerified")} />
                  ) : (
                    <Chip size="small" color="warning" icon={<MarkEmailUnreadOutlined />} label={t("profile.values.emailNotVerified")} />
                  )}
                </Stack>
                <Typography variant="body1" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                  {[fullName, user.username ? `@${user.username}` : null].filter(Boolean).join(" - ") || user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {user.profile?.bio ?? t("profile.values.noBio")}
                </Typography>
              </Box>

              {canEditProfile && !editMode && (
                <Stack direction="row" spacing={1}>
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<EditOutlined />}
                    onClick={() => setEditMode(true)}
                  >
                    {t("actions.edit")}
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {editMode && canEditProfile && (
          <EditableProfileCard
            form={form}
            onCancel={handleCancelEdit}
            onSubmit={handleSubmitProfile}
            saving={updateMutation.isPending}
            t={t}
          />
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              icon={<LoginOutlined />}
              label={t("profile.labels.lastLogin")}
              value={formatDateTime(user.last_login_at)}
              caption={t("profile.values.totalLogins", { count: user.metadata?.login_count ?? 0 })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              icon={<ShieldOutlined />}
              label={t("profile.sections.security")}
              value={user.security?.two_factor_enabled ? t("profile.values.twoFactorEnabled") : t("profile.values.twoFactorDisabled")}
              caption={t("profile.values.failedAttempts", { count: user.security?.failed_login_count ?? 0 })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              icon={<BadgeOutlined />}
              label={t("profile.labels.tenant")}
              value={user.tenant_id ?? t("profile.values.unknown")}
              caption={t("profile.values.authProvider", { provider: user.auth_provider ?? t("profile.values.unknown") })}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard title={t("profile.sections.account")} icon={<AccountCircleOutlined />}>
              <DetailRow icon={<FingerprintOutlined />} label={t("profile.labels.userId")} value={user.id} />
              <DetailRow icon={<EmailOutlined />} label={t("profile.labels.email")} value={user.email} />
              <DetailRow icon={<BadgeOutlined />} label={t("profile.labels.roles")} value={<ChipList values={user.roles ?? []} />} />
              <DetailRow icon={<CalendarMonthOutlined />} label={t("profile.labels.created")} value={formatDateTime(user.created_at)} />
              <DetailRow icon={<CalendarMonthOutlined />} label={t("profile.labels.updated")} value={formatDateTime(user.updated_at)} />
              <DetailRow
                icon={<GppMaybeOutlined />}
                label={t("profile.labels.statusChanged")}
                value={t("profile.values.changedBy", {
                  date: formatDateTime(user.status_changed_at),
                  actor: user.status_changed_by ?? t("profile.values.unknown"),
                })}
              />
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard title={t("profile.sections.profile")} icon={<BadgeOutlined />}>
              <DetailRow icon={<PhoneOutlined />} label={t("profile.labels.phone")} value={withVerification(user.profile?.phone_number, user.profile?.phone_verified, t)} />
              <DetailRow icon={<LocationOnOutlined />} label={t("profile.labels.location")} value={location || t("profile.values.unknown")} />
              <DetailRow icon={<LanguageOutlined />} label={t("profile.labels.language")} value={user.profile?.language?.toUpperCase() ?? t("profile.values.unknown")} />
              <DetailRow
                icon={<PublicOutlined />}
                label={t("profile.labels.timezone")}
                value={user.profile?.timezone ? formatTimezoneLabel(user.profile.timezone) : t("profile.values.unknown")}
              />
              <DetailRow icon={<CalendarMonthOutlined />} label={t("profile.labels.dateOfBirth")} value={formatDate(user.profile?.date_of_birth)} />
              <DetailRow
                icon={<LinkOutlined />}
                label={t("profile.labels.avatarUrl")}
                value={user.profile?.avatar_url ? <ExternalLink href={user.profile.avatar_url} label={user.profile.avatar_url} /> : t("profile.values.none")}
              />
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard title={t("profile.sections.security")} icon={<LockOutlined />}>
              <DetailRow icon={<VerifiedUserOutlined />} label={t("profile.labels.twoFactor")} value={booleanChip(user.security?.two_factor_enabled, t("profile.values.enabled"), t("profile.values.disabled"))} />
              <DetailRow icon={<KeyOutlined />} label={t("profile.labels.passwordUpdated")} value={formatDateTime(user.security?.password_updated_at)} />
              <DetailRow icon={<GppMaybeOutlined />} label={t("profile.labels.lockedUntil")} value={formatNullableDateTime(user.security?.locked_until, t)} />
              <DetailRow icon={<GppMaybeOutlined />} label={t("profile.labels.lastFailedLogin")} value={formatNullableDateTime(user.security?.last_failed_login_at, t)} />
              <DetailRow icon={<LoginOutlined />} label={t("profile.labels.signupIp")} value={user.metadata?.signup_ip ?? t("profile.values.unknown")} />
              <DetailRow icon={<LoginOutlined />} label={t("profile.labels.lastLoginIp")} value={user.metadata?.last_login_ip ?? t("profile.values.unknown")} />
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard title={t("profile.sections.preferences")} icon={<PolicyOutlined />}>
              <DetailRow icon={<PublicOutlined />} label={t("profile.labels.theme")} value={themeLabel(user.preferences?.theme, t)} />
              <DetailRow icon={<EmailOutlined />} label={t("profile.labels.emailNotifications")} value={booleanChip(user.preferences?.notifications?.email, t("profile.values.on"), t("profile.values.off"))} />
              <DetailRow icon={<PhoneOutlined />} label={t("profile.labels.smsNotifications")} value={booleanChip(user.preferences?.notifications?.sms, t("profile.values.on"), t("profile.values.off"))} />
              <DetailRow icon={<MarkEmailUnreadOutlined />} label={t("profile.labels.marketing")} value={booleanChip(user.preferences?.notifications?.marketing, t("profile.values.on"), t("profile.values.off"))} />
              <DetailRow icon={<EmailOutlined />} label={t("profile.labels.emailPrivacy")} value={privacyLabel(user.preferences?.privacy?.email, t)} />
              <DetailRow icon={<PolicyOutlined />} label={t("profile.labels.termsVersion")} value={user.terms_version ?? t("profile.values.unknown")} />
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard title={t("profile.sections.connectedAccounts")} icon={<LinkOutlined />}>
              {Object.entries(user.profile?.social ?? {}).map(([provider, href]) => (
                <DetailRow
                  key={provider}
                  icon={<LinkOutlined />}
                  label={titleCase(provider)}
                  value={href ? <ExternalLink href={href} label={href} /> : t("profile.values.notConnected")}
                />
              ))}
              {Object.entries(user.external_ids ?? {}).map(([provider, id]) => (
                <DetailRow
                  key={provider}
                  icon={<FingerprintOutlined />}
                  label={`${titleCase(provider)} ID`}
                  value={id ?? t("profile.values.notConnected")}
                />
              ))}
              {!Object.keys(user.profile?.social ?? {}).length && !Object.keys(user.external_ids ?? {}).length ? (
                <DetailRow icon={<LinkOutlined />} label={t("profile.labels.accounts")} value={t("profile.values.noneConnected")} />
              ) : null}
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard title={t("profile.sections.compliance")} icon={<PolicyOutlined />}>
              <DetailRow icon={<PolicyOutlined />} label={t("profile.labels.termsAccepted")} value={formatDateTime(user.terms_accepted_at)} />
              <DetailRow icon={<PolicyOutlined />} label={t("profile.labels.privacyAccepted")} value={formatDateTime(user.privacy_accepted_at)} />
              <DetailRow
                icon={<ShieldOutlined />}
                label={t("profile.labels.featureGates")}
                value={(user.feature_gates ?? []).length > 0 ? <ChipList values={user.feature_gates ?? []} /> : t("profile.values.none")}
              />
              <DetailRow icon={<PublicOutlined />} label={t("profile.labels.userAgent")} value={user.metadata?.user_agent ?? t("profile.values.unknown")} />
            </InfoCard>
          </Grid>
        </Grid>

        {canEditProfile && (
          <Card variant="outlined" sx={{ borderColor: "error.main" }}>
            <CardHeader
              title={t("profile.deleteAccount.title")}
              slotProps={{ title: { variant: "h6", color: "error" } }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t("profile.deleteAccount.description")}
                </Typography>
                <Button
                  type="button"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteOutlineOutlined />}
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deleteAccountMutation.isPending}
                >
                  {t("profile.deleteAccount.button")}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t("profile.deleteAccount.confirmTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("profile.deleteAccount.confirmMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteAccountMutation.isPending}>
            {t("actions.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteAccount}
            disabled={deleteAccountMutation.isPending || !data.id}
          >
            {t("profile.deleteAccount.confirmButton")}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

function InfoCard({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }): JSX.Element {
  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        avatar={<Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>}
        title={title}
        slotProps={{ title: { variant: "h6" } }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack divider={<Divider flexItem />} spacing={1.25}>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function EditableProfileCard({
  form,
  onCancel,
  onSubmit,
  saving,
  t,
}: {
  form: UseFormReturn<ProfileFormValues>;
  onCancel: () => void;
  onSubmit: (values: ProfileFormValues) => void;
  saving: boolean;
  t: TFunction<"common">;
}): JSX.Element {
  return (
    <Card component="form" onSubmit={form.handleSubmit(onSubmit)}>
      <CardHeader
        title={t("profile.editProfile")}
        action={(
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveOutlined />}
              disabled={saving}
            >
              {t("actions.save")}
            </Button>
            <Button
              type="button"
              variant="outlined"
              startIcon={<CloseOutlined />}
              onClick={onCancel}
              disabled={saving}
            >
              {t("actions.cancel")}
            </Button>
          </Stack>
        )}
        slotProps={{ title: { variant: "h6" } }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ControlledTextField form={form} name="display_name" label={t("profile.labels.displayName")} disabled={saving} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ControlledTextField form={form} name="first_name" label={t("profile.labels.firstName")} disabled={saving} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ControlledTextField form={form} name="last_name" label={t("profile.labels.lastName")} disabled={saving} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              control={form.control}
              name="gender"
              render={({ field }) => (
                <TextField {...field} select fullWidth margin="normal" label={t("profile.labels.gender")} disabled={saving}>
                  <MenuItem value="">{t("profile.gender.notSpecified")}</MenuItem>
                  <MenuItem value="male">{t("profile.gender.male")}</MenuItem>
                  <MenuItem value="female">{t("profile.gender.female")}</MenuItem>
                  <MenuItem value="other">{t("profile.gender.other")}</MenuItem>
                  <MenuItem value="prefer_not_to_say">{t("profile.gender.preferNotToSay")}</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ControlledTextField form={form} name="date_of_birth" label={t("profile.labels.dateOfBirth")} type="date" disabled={saving} slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ControlledTextField form={form} name="phone_number" label={t("profile.labels.phone")} disabled={saving} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              control={form.control}
              name="language"
              render={({ field }) => (
                <TextField {...field} select fullWidth margin="normal" label={t("profile.labels.preferredLanguage")} disabled={saving}>
                  <MenuItem value="">{t("profile.values.noPreference")}</MenuItem>
                  {SUPPORTED_LANGS.map((language) => (
                    <MenuItem key={language} value={language}>
                      {LANG_LABELS[language]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <TextField {...field} select fullWidth margin="normal" label={t("profile.labels.timezone")} disabled={saving}>
                  <MenuItem value="">{t("profile.values.noPreference")}</MenuItem>
                  {TIMEZONE_OPTIONS.map((timezone) => (
                    <MenuItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ControlledTextField form={form} name="bio" label={t("profile.labels.bio")} disabled={saving} multiline minRows={3} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ControlledTextField form={form} name="avatar_url" label={t("profile.labels.avatarUrl")} disabled={saving} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ControlledTextField form={form} name="linkedin" label={t("profile.labels.linkedinUrl")} disabled={saving} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <ControlledTextField form={form} name="city" label={t("profile.labels.city")} disabled={saving} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <ControlledTextField form={form} name="state" label={t("profile.labels.state")} disabled={saving} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <ControlledTextField form={form} name="country" label={t("profile.labels.country")} disabled={saving} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <ControlledTextField form={form} name="zip" label={t("profile.labels.zip")} disabled={saving} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              control={form.control}
              name="theme"
              render={({ field }) => (
                <TextField {...field} select fullWidth margin="normal" label={t("profile.labels.theme")} disabled={saving}>
                  <MenuItem value="system">{t("theme.system")}</MenuItem>
                  <MenuItem value="light">{t("theme.light")}</MenuItem>
                  <MenuItem value="dark">{t("theme.dark")}</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              control={form.control}
              name="email_privacy"
              render={({ field }) => (
                <TextField {...field} select fullWidth margin="normal" label={t("profile.labels.emailPrivacy")} disabled={saving}>
                  <MenuItem value="private">{t("profile.privacy.private")}</MenuItem>
                  <MenuItem value="workspace">{t("profile.privacy.workspace")}</MenuItem>
                  <MenuItem value="public">{t("profile.privacy.public")}</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
              <Controller
                control={form.control}
                name="notify_email"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} disabled={saving} />}
                    label={t("profile.labels.emailNotifications")}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="notify_sms"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} disabled={saving} />}
                    label={t("profile.labels.smsNotifications")}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="notify_marketing"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} disabled={saving} />}
                    label={t("profile.labels.marketing")}
                  />
                )}
              />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  caption,
  icon,
  label,
  value,
}: {
  caption: string;
  icon: ReactNode;
  label: string;
  value: string;
}): JSX.Element {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <Box sx={{ color: "primary.main", display: "flex", pt: 0.25 }}>{icon}</Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="subtitle1" sx={{ wordBreak: "break-word" }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {caption}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }): JSX.Element {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", py: 0.25 }}>
      <Box sx={{ color: "text.secondary", display: "flex", pt: 0.25 }}>{icon}</Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Box sx={{ mt: 0.25, wordBreak: "break-word", overflowWrap: "anywhere" }}>
          {typeof value === "string" ? <Typography variant="body2">{value}</Typography> : value}
        </Box>
      </Box>
    </Stack>
  );
}

function StatusChip({ status = "active" }: { status?: UserStatus }): JSX.Element {
  const color: "default" | "error" | "success" | "warning" =
    status === "active" ? "success" : status === "pending_verification" ? "warning" : "error";

  return <Chip size="small" color={color} label={titleCase(status.replaceAll("_", " "))} />;
}

function ChipList({ values }: { values: string[] }): JSX.Element {
  return (
    <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap" }}>
      {values.map((value) => (
        <Chip key={value} size="small" label={value} />
      ))}
    </Stack>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }): JSX.Element {
  return (
    <Tooltip title={href}>
      <Link href={href} target="_blank" rel="noreferrer" variant="body2">
        {label}
      </Link>
    </Tooltip>
  );
}

function booleanChip(value: boolean | undefined, trueLabel: string, falseLabel: string): JSX.Element {
  return <Chip size="small" color={value ? "success" : "default"} label={value ? trueLabel : falseLabel} />;
}

function withVerification(value: string | undefined, verified: boolean | undefined, t: TFunction<"common">): JSX.Element {
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
      <Typography variant="body2">{value ?? t("profile.values.unknown")}</Typography>
      {booleanChip(verified, t("profile.values.verified"), t("profile.values.unverified"))}
    </Stack>
  );
}

function initials(nameOrEmail?: string): string {
  const base = nameOrEmail?.includes("@") ? nameOrEmail.split("@")[0] : (nameOrEmail ?? "User");
  const parts = base.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? "U"}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function formatDate(value?: string | null): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function formatDateTime(value?: string | null): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatNullableDateTime(value: string | null | undefined, t: TFunction<"common">): string {
  return value ? formatDateTime(value) : t("profile.values.none");
}

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
}

function themeLabel(value: string | undefined, t: TFunction<"common">): string {
  if (value === "light") return t("theme.light");
  if (value === "dark") return t("theme.dark");
  if (value === "system") return t("theme.system");
  return t("profile.values.unknown");
}

function privacyLabel(value: string | undefined, t: TFunction<"common">): string {
  if (value === "private") return t("profile.privacy.private");
  if (value === "workspace") return t("profile.privacy.workspace");
  if (value === "public") return t("profile.privacy.public");
  return t("profile.values.unknown");
}

function getMissingProfileFields(user: Partial<UserProfile>): string[] {
  const missing: string[] = [];

  if (!user.profile) missing.push("profile");
  if (!user.security) missing.push("security");
  if (!user.preferences) missing.push("preferences");
  if (!user.metadata) missing.push("metadata");
  if (!user.external_ids) missing.push("external_ids");
  if (!Array.isArray(user.feature_gates)) missing.push("feature_gates");

  return missing;
}

function toProfileFormValues(user: UserProfile): ProfileFormValues {
  return {
    display_name: user.display_name ?? "",
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    gender: toGenderValue(user.profile?.gender),
    date_of_birth: user.profile?.date_of_birth ?? "",
    bio: user.profile?.bio ?? "",
    language: toPreferredLanguageValue(user.profile?.language),
    timezone: user.profile?.timezone ?? "",
    avatar_url: user.profile?.avatar_url ?? "",
    phone_number: user.profile?.phone_number ?? "",
    city: user.profile?.location?.city ?? "",
    state: user.profile?.location?.state ?? "",
    country: user.profile?.location?.country ?? "",
    zip: user.profile?.location?.zip ?? "",
    linkedin: user.profile?.social?.linkedin ?? "",
    theme: user.preferences?.theme ?? "system",
    notify_email: user.preferences?.notifications?.email ?? false,
    notify_sms: user.preferences?.notifications?.sms ?? false,
    notify_marketing: user.preferences?.notifications?.marketing ?? false,
    email_privacy: user.preferences?.privacy?.email ?? "private",
  };
}

function toUpdateMyProfilePayload(values: ProfileFormValues): UpdateMyProfilePayload {
  return {
    display_name: trimToUndefined(values.display_name),
    first_name: trimToUndefined(values.first_name),
    last_name: trimToUndefined(values.last_name),
    profile: {
      gender: trimToUndefined(values.gender),
      date_of_birth: trimToNull(values.date_of_birth),
      bio: trimToUndefined(values.bio),
      language: trimToUndefined(values.language),
      timezone: trimToUndefined(values.timezone),
      avatar_url: trimToUndefined(values.avatar_url),
      phone_number: trimToUndefined(values.phone_number),
      location: {
        city: trimToUndefined(values.city),
        state: trimToUndefined(values.state),
        country: trimToUndefined(values.country),
        zip: trimToUndefined(values.zip),
      },
      social: {
        linkedin: trimToNull(values.linkedin),
      },
    },
    preferences: {
      theme: values.theme,
      notifications: {
        email: values.notify_email,
        sms: values.notify_sms,
        marketing: values.notify_marketing,
      },
      privacy: {
        email: trimToUndefined(values.email_privacy) ?? "private",
      },
    },
  };
}

function trimToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function trimToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toGenderValue(value?: string | null): GenderValue {
  if (value === "male" || value === "female" || value === "other" || value === "prefer_not_to_say") {
    return value;
  }

  return "";
}

function toPreferredLanguageValue(value?: string | null): PreferredLanguageValue {
  if (value === "en" || value === "ru" || value === "pl") {
    return value;
  }

  return "";
}
