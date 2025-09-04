import type { JSX } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageContainer from "@/components/PageContainer";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

export default function Home(): JSX.Element {
  const { t } = useTranslation();

  const whatsNewItems = t("home.whatsNew.items", { returnObjects: true }) as string[];
  const whatsNewVersions = t("home.whatsNew.versions", { returnObjects: true }) as string[] | undefined;

  const systems = t("home.system.systems", { returnObjects: true }) as { name: string; status: "ok" | "off" | "degraded" }[] | undefined;
  const tasks = t("home.tasks.items", { returnObjects: true }) as { title: string; due: string; status: "todo" | "in_progress" | "done" }[] | undefined;
  const progressItems = t("home.progress.items", { returnObjects: true }) as { label: string; percent: number }[] | undefined;

  return (
    <PageContainer>
      {/* Hero */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4">{t("home.title")}</Typography>
        <Typography variant="body1" color="text.secondary">
          {t("home.subtitle")}
        </Typography>
      </Stack>

      <Grid container spacing={2} alignItems="stretch">
        {/* ===== Left column (≈70%) ===== */}
        <Grid item xs={12} md={8} sx={{
          flex: 1,          // ← берём оставшуюся ширину
          minWidth: 0,      // ← разрешаем сжатие
          wordBreak: "break-word",
          overflowWrap: "anywhere"
        }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            {/* What's new */}
            <Card sx={{ display: "flex", flexDirection: "column" }}>
              <CardHeader title={t("home.whatsNew.title")} />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.2}>
                  {(whatsNewItems ?? []).slice(0, 10).map((text, i) => {
                    const version = whatsNewVersions?.[i % (whatsNewVersions?.length || 1)] ?? "v0.1.0";
                    return (
                      <Stack key={i} direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={version} />
                        <Typography variant="body2">{text}</Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            {/* Demo content */}
            <Card sx={{ display: "flex", flexDirection: "column" }}>
              <CardHeader title={t("home.placeholder.title")} />
              <CardContent sx={{ pt: 0 }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {t("home.placeholder.text")}
                </Typography>
              </CardContent>
            </Card>

            {/* Task manager */}
            <Card sx={{ display: "flex", flexDirection: "column" }}>
              <CardHeader title={t("home.tasks.title")} />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.2}>
                  {(tasks ?? []).map((task, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap title={task.title}>{task.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{task.due}</Typography>
                      </Box>
                      <Chip size="small" label={taskStatusLabel(task.status)} color={taskStatusColor(task.status)} />
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* ===== Right column (≈30%) ===== */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            {/* Quick actions */}
            <Card sx={{ display: "flex", flexDirection: "column" }}>
              <CardHeader title={t("home.quickActions.title")} />
              <CardContent sx={{ pt: 0 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Button component={RouterLink} to="/users" variant="contained" size="small">
                    {t("home.quickActions.openUsers")}
                  </Button>
                  <Button component={RouterLink} to="/forum" variant="outlined" size="small">
                    {t("home.quickActions.forum")}
                  </Button>
                  <Button component={RouterLink} to="/settings" variant="outlined" size="small">
                    {t("home.quickActions.settings")}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* System status */}
            <Card sx={{ display: "flex", flexDirection: "column" }}>
              <CardHeader title={t("home.system.title")} />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.2}>
                  {(systems ?? []).slice(0, 7).map((s, i) => (
                    <Row
                      key={i}
                      label={s.name}
                      value={<Chip size="small" label={statusLabel(t, s.status)} color={statusColor(s.status)} />}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Progress update */}
            <Card sx={{ display: "flex", flexDirection: "column" }}>
              <CardHeader title={t("home.progress.title")} />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  {(progressItems ?? []).map((p, i) => (
                    <ProgressRow key={i} label={p.label} percent={p.percent} />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Footer / Copyright — в самом низу */}
      <Box component="footer" sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          {t("home.footer.copyright")}
        </Typography>
      </Box>
    </PageContainer>
  );
}

/* ================= helpers ================= */

function Row({ label, value }: { label: string; value: JSX.Element }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
      <Typography variant="body2" color="text.secondary" noWrap title={label}>
        {label}
      </Typography>
      {value}
    </Box>
  );
}

function statusColor(s: "ok" | "off" | "degraded"): "success" | "default" | "warning" {
  if (s === "ok") return "success";
  if (s === "degraded") return "warning";
  return "default";
}

function statusLabel(t: (k: string) => string, s: "ok" | "off" | "degraded") {
  const map = { ok: "home.system.status.ok", off: "home.system.status.off", degraded: "home.system.status.degraded" };
  return t(map[s]);
}

function taskStatusLabel(s: "todo" | "in_progress" | "done") {
  if (s === "done") return "Done";
  if (s === "in_progress") return "In progress";
  return "To do";
}
function taskStatusColor(s: "todo" | "in_progress" | "done"): "default" | "primary" | "success" {
  if (s === "done") return "success";
  if (s === "in_progress") return "primary";
  return "default";
}

function barColor(percent: number): "success" | "warning" | "error" | "primary" {
  if (percent >= 90) return "success";
  if (percent >= 70) return "warning";
  if (percent >= 50) return "error";
  return "primary";
}

function ProgressRow({ label, percent }: { label: string; percent: number }) {
  const color = barColor(percent);
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {Math.round(percent)}%
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, percent))} color={color} />
    </Stack>
  );
}
