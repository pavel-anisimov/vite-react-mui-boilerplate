// src/app/pages/auth/VerifyEmail.tsx
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import type { JSX } from "react";

import { verifyEmail } from "@/api/auth";
import AuthLayout from "@/components/AuthLayout";

type VerifyStatus = "missing-token" | "verifying" | "success" | "error";

/**
 * Renders the email verification page reached from the link in the verification email.
 *
 * The page reads the `token` query parameter and calls GET /auth/verify on the
 * gateway. Verification never logs the user in — every terminal state links to
 * the Sign In page instead.
 *
 * States:
 * - missing-token: no `token` in the query string — shows a clear error.
 * - verifying: the request is in flight — shows a spinner.
 * - success: "Email verified. You can now sign in."
 * - error: shows the gateway error message when available, a generic one otherwise.
 *
 * @constructor
 * @return {JSX.Element} The verification status screen inside the auth layout.
 */
export default function VerifyEmail(): JSX.Element {
  const { t } = useTranslation("common");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>(token ? "verifying" : "missing-token");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Verification tokens are single-use: guard against StrictMode double-running the effect.
  const requestedRef = useRef(false);

  /**
   * Extracts a human-readable message from a gateway error response.
   * The gateway may populate any of `message`, `error`, or `detail`.
   */
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null) {
      type MaybeAxios = {
        response?: { data?: { message?: unknown; error?: unknown; detail?: unknown } };
      };
      const data = (error as MaybeAxios).response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        (typeof data?.detail === "string" && data.detail) ||
        null;
      if (message && message.trim()) return message;
    }
    return t("auth.verifyFailed");
  };

  useEffect(() => {
    if (!token || requestedRef.current) return;
    requestedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        await verifyEmail(token);
        if (!cancelled) setStatus("success");
      } catch (caught: unknown) {
        if (!cancelled) {
          setErrorMessage(getErrorMessage(caught));
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mount for the given token
  }, [token]);

  return (
    <AuthLayout title={t("auth.checkEmail")} subtitle={t("auth.weSentVerify")}>
      {status === "verifying" && (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mt: 1 }}>
          <CircularProgress size={24} />
          <Typography variant="body1">{t("auth.verifyingEmail")}</Typography>
        </Stack>
      )}
      {status === "success" && (
        <Alert severity="success" sx={{ mt: 1 }}>
          {t("auth.emailVerified")}
        </Alert>
      )}
      {status === "missing-token" && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {t("auth.verifyTokenMissing")}
        </Alert>
      )}
      {status === "error" && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {errorMessage ?? t("auth.verifyFailed")}
        </Alert>
      )}
      {status !== "verifying" && (
        <Box sx={{ mt: 2 }}>
          <Button href="/auth/sign-in" fullWidth variant="contained">
            {t("auth.signIn")}
          </Button>
        </Box>
      )}
    </AuthLayout>
  );
}
