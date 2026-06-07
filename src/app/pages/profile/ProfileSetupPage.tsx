// src/app/pages/profile/ProfileSetupPage.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Card, CardContent, CardHeader, Grid, LinearProgress, MenuItem } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import type { JSX } from "react";
import type { Location } from "react-router-dom";

import { getMyProfile, updateMyProfile } from "@/api/profile";
import { useAuth } from "@/app/providers/AuthProvider";
import PageContainer from "@/components/PageContainer";
import ControlledTextField from "@/components/form/ControlledTextField";
import { LANG_LABELS, SUPPORTED_LANGS } from "@/i18n/langConfig";
import { TIMEZONE_OPTIONS } from "@/utils/timezones";

import type { MyProfileData, UpdateMyProfilePayload } from "@/api/types";

type RouteState = { from?: { pathname?: string } } | null | undefined;

type FormValues = {
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  phoneNumber: string;
  dateOfBirth: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  language: string;
  timezone: string;
};

const EMPTY_VALUES: FormValues = {
  displayName: "",
  firstName: "",
  lastName: "",
  bio: "",
  phoneNumber: "",
  dateOfBirth: "",
  city: "",
  state: "",
  country: "",
  zip: "",
  language: "",
  timezone: "",
};

/** Maps the fetched profile to flat form values (nulls become empty strings). */
function toFormValues(profile: MyProfileData): FormValues {
  return {
    displayName: profile.displayName ?? "",
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    bio: profile.bio ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    city: profile.location.city ?? "",
    state: profile.location.state ?? "",
    country: profile.location.country ?? "",
    zip: profile.location.zip ?? "",
    language: profile.language ?? "",
    timezone: profile.timezone ?? "",
  };
}

/** Maps form values to the PATCH payload (trimmed; empty strings become nulls). */
function toPayload(values: FormValues): UpdateMyProfilePayload {
  const orNull = (value: string): string | null => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    displayName: orNull(values.displayName),
    firstName: orNull(values.firstName),
    lastName: orNull(values.lastName),
    bio: orNull(values.bio),
    phoneNumber: orNull(values.phoneNumber),
    dateOfBirth: orNull(values.dateOfBirth),
    location: {
      city: orNull(values.city),
      state: orNull(values.state),
      country: orNull(values.country),
      zip: orNull(values.zip),
    },
    language: orNull(values.language),
    timezone: orNull(values.timezone),
  };
}

/**
 * Profile setup page for the current user, shown at /profile/setup.
 *
 * New users with `profileCompleted === false` are redirected here after
 * sign-in. The page loads the editable profile from GET /auth/me/profile,
 * lets the user fill in the basics (displayName is required — the backend
 * marks the profile completed when it is non-empty) and PATCHes the changes
 * back. On success the auth user is refreshed so `profileCompleted` updates,
 * and the user is sent to the originally intended route (or home).
 *
 * @constructor
 * @return {JSX.Element} The profile setup form.
 */
export default function ProfileSetupPage(): JSX.Element {
  const { t } = useTranslation("common");
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as Location & { state: RouteState };
  const queryClient = useQueryClient();

  const schema = z.object({
    displayName: z
      .string()
      .trim()
      .min(1, t("validation.required", { field: t("profile.labels.displayName") })),
    firstName: z.string(),
    lastName: z.string(),
    bio: z.string(),
    phoneNumber: z.string(),
    dateOfBirth: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
    language: z.string(),
    timezone: z.string(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  const { data, error, isError, isPending } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) form.reset(toFormValues(data.profile));
  }, [data, form]);

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async (updated) => {
      queryClient.setQueryData(["my-profile"], updated);
      // Refresh /auth/me so profileCompleted is up to date before navigating.
      await refreshUser().catch(() => undefined);
      const from = (location.state as RouteState)?.from?.pathname;
      navigate(from && from !== "/profile/setup" ? from : "/", { replace: true });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    updateMutation.mutate(toPayload(values));
  });

  return (
    <PageContainer>
      <Card component="form" onSubmit={onSubmit} sx={{ maxWidth: 720, mx: "auto" }}>
        <CardHeader
          title={t("profile.setup.title")}
          subheader={t("profile.setup.subtitle")}
          slotProps={{ title: { variant: "h5" } }}
        />
        <CardContent sx={{ pt: 0 }}>
          {isPending && <LinearProgress sx={{ mb: 2 }} />}
          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(error as Error)?.message ?? t("profile.errors.load")}
            </Alert>
          )}
          {updateMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(updateMutation.error as Error)?.message ?? t("profile.errors.update")}
            </Alert>
          )}

          <ControlledTextField form={form} name="displayName" label={t("profile.labels.displayName")} required />
          <Grid container columnSpacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledTextField form={form} name="firstName" label={t("profile.labels.firstName")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledTextField form={form} name="lastName" label={t("profile.labels.lastName")} />
            </Grid>
          </Grid>
          <ControlledTextField form={form} name="bio" label={t("profile.labels.bio")} multiline minRows={3} />
          <Grid container columnSpacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledTextField form={form} name="phoneNumber" label={t("profile.labels.phone")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledTextField
                form={form}
                name="dateOfBirth"
                label={t("profile.labels.dateOfBirth")}
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>
          <Grid container columnSpacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledTextField form={form} name="city" label={t("profile.labels.city")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledTextField form={form} name="state" label={t("profile.labels.state")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledTextField form={form} name="country" label={t("profile.labels.country")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledTextField form={form} name="zip" label={t("profile.labels.zip")} />
            </Grid>
          </Grid>
          <Grid container columnSpacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledTextField form={form} name="language" label={t("profile.labels.language")} select>
                {SUPPORTED_LANGS.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {LANG_LABELS[lang]}
                  </MenuItem>
                ))}
              </ControlledTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledTextField form={form} name="timezone" label={t("profile.labels.timezone")} select>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </ControlledTextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Button type="submit" fullWidth variant="contained" loading={updateMutation.isPending} disabled={isPending}>
              {t("actions.save")}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
