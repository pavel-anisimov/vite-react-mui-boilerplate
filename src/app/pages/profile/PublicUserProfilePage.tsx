import {
  AccountCircleOutlined,
  CalendarMonthOutlined,
  LanguageOutlined,
  LinkOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";

import { getPublicUserProfile } from "@/api/profile";
import PageContainer from "@/components/PageContainer";

import type { JSX, ReactNode } from "react";
import type { PublicUserProfile } from "@/api/profile";

export default function PublicUserProfilePage(): JSX.Element {
  const { t } = useTranslation("common");
  const { id } = useParams<{ id?: string }>();

  const {
    data,
    error,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["public-user-profile", id],
    queryFn: () => getPublicUserProfile(id!),
    enabled: Boolean(id),
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  if (!id) {
    return <Navigate to="/" replace />;
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
              {t("profile.loadingUser", { userId: id })}
            </Alert>
          )}
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        {isError && (
          <Alert severity="error">
            {(error as Error)?.message ?? t("profile.errors.load")}
          </Alert>
        )}
        {isFetching && (
          <Alert severity="info">
            {t("profile.loadingUser", { userId: id })}
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
                src={data.avatar_url ?? undefined}
                sx={{ width: 88, height: 88, bgcolor: "primary.main", fontSize: 32, fontWeight: 700 }}
              >
                {initials(data.display_name || data.username || data.id)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.75 }}>
                  <Typography variant="h4" sx={{ wordBreak: "break-word" }}>
                    {data.display_name || data.username}
                  </Typography>
                  <Chip size="small" label={visibilityLabel(data.profile_visibility)} />
                </Stack>
                <Typography variant="body1" color="text.secondary">
                  @{data.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {data.bio ?? t("profile.values.noBio")}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard title={t("profile.sections.profile")} icon={<AccountCircleOutlined />}>
              <DetailRow icon={<LocationOnOutlined />} label={t("profile.labels.location")} value={publicLocation(data)} />
              <DetailRow icon={<CalendarMonthOutlined />} label={t("profile.labels.created")} value={formatDate(data.member_since)} />
              <DetailRow icon={<CalendarMonthOutlined />} label={t("profile.labels.lastSeen", { defaultValue: "Last seen" })} value={formatNullableDateTime(data.last_seen_at, t("profile.values.none"))} />
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard title={t("profile.sections.connectedAccounts")} icon={<LinkOutlined />}>
              {recordEntries(data.public_social).map(([provider, href]) => (
                <DetailRow
                  key={provider}
                  icon={<LinkOutlined />}
                  label={titleCase(provider)}
                  value={href ? <ExternalLink href={href} label={href} /> : t("profile.values.notConnected")}
                />
              ))}
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <InfoCard title={t("profile.labels.featureGates", { defaultValue: "Badges" })} icon={<LanguageOutlined />}>
              {data.badges.length > 0 ? <ChipList values={data.badges} /> : <Typography variant="body2">{t("profile.values.none")}</Typography>}
            </InfoCard>
          </Grid>
        </Grid>
      </Stack>
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
        <Stack spacing={1}>{children}</Stack>
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

function ExternalLink({ href, label }: { href: string; label: string }): JSX.Element {
  return (
    <Link href={href} target="_blank" rel="noreferrer" variant="body2">
      {label}
    </Link>
  );
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

function recordEntries(record: Record<string, string | null>): Array<[string, string | null]> {
  return Object.entries(record);
}

function publicLocation(profile: PublicUserProfile): string {
  return [
    profile.public_location?.city,
    profile.public_location?.country,
  ].filter(Boolean).join(", ") || "Unknown";
}

function initials(nameOrEmail: string): string {
  const base = nameOrEmail.trim();
  const at = base.indexOf("@");
  const name = at > 0 ? base.slice(0, at) : base;
  const parts = name.split(/\s+/);
  const first = parts[0]?.[0];
  const second = parts[1]?.[0];
  return (first ?? "U").toUpperCase() + (second?.toUpperCase() ?? "");
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatNullableDateTime(value: string | null, fallback: string): string {
  if (!value) return fallback;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
}

function visibilityLabel(value: PublicUserProfile["profile_visibility"]): string {
  return titleCase(value);
}
