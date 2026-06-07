import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

import type { JSX } from "react";

import { resetPassword } from "@/api/auth";
import AuthLayout from "@/components/AuthLayout";
import ControlledTextField from "@/components/form/ControlledTextField";

/**
 * Schema for password validation.
 *
 * This schema validates the following:
 * - `password` must be a string with at least 8 characters, including at least one number and one uppercase letter.
 * - `confirmPassword` must match the `password` field exactly.
 *
 * Validates:
 * - Password strength requirements (minimum length, inclusion of a number, inclusion of an uppercase letter).
 * - Matching password and confirmation password fields.
 *
 * If the validation fails, appropriate error messages are generated:
 * - "Min 8 characters" if the password does not meet the minimum length.
 * - "Add a number" if the password does not contain at least one numeric digit.
 * - "Add an uppercase" if the password does not contain at least one uppercase letter.
 * - "Passwords do not match" if `confirmPassword` does not match the `password`.
 */
const schema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Min 8 characters" })
      .regex(/\d/, { message: "Add a number" })
      .regex(/[A-Z]/, { message: "Add an uppercase" }),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Form = z.infer<typeof schema>;

/**
 * Extracts a human-readable message from a gateway error response.
 * The gateway may populate any of `message`, `error`, or `detail`.
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    type MaybeAxios = {
      response?: { data?: { message?: unknown; error?: unknown; detail?: unknown } };
      message?: unknown;
    };
    const e = error as MaybeAxios;
    const data = e.response?.data;
    const message =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      (typeof data?.detail === "string" && data.detail) ||
      (typeof e.message === "string" && e.message) ||
      null;
    if (message && message.trim()) return message;
  }
  return "Failed to reset password";
}

/**
 * Handles the password reset functionality reached from the link in the reset email.
 *
 * The page reads the `token` query parameter and submits `{ token, password }`
 * to POST /auth/reset-password on the gateway. Resetting never logs the user
 * in — after success the form is replaced with a confirmation and a link to
 * the Sign In page.
 *
 * @constructor
 * @return {JSX.Element} A React component that renders the password reset form including
 * fields for new password, confirm password, and appropriate error or loading states.
 */
export default function ResetPassword(): JSX.Element {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const tokenMissing = token.length === 0;

  /**
   * Event handler function for form submission.
   *
   * This function:
   * - Clears any previous error state.
   * - Sets a loading state to true to indicate processing.
   * - Submits the reset token and the new password to the gateway.
   * - On success, switches the page to a confirmation state with a Sign In
   *   link (no automatic sign-in is performed).
   * - On error, shows the gateway error message when available.
   * - Ensures that the loading state is reset after the operation is completed.
   */
  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);

    try {
      await resetPassword({ token, password: values.password });
      setResetDone(true);
    } catch (caught: unknown) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  });

  if (resetDone) {
    return (
      <AuthLayout title="Password reset" subtitle="All set">
        <Alert severity="success" sx={{ mt: 1 }}>
          Password has been reset. You can now sign in.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button href="/auth/sign-in" fullWidth variant="contained">
            Go to Sign In
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password">
      {tokenMissing && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Missing or invalid token. Please use the link from your email.
        </Alert>
      )}
      <form onSubmit={onSubmit} noValidate>
        <ControlledTextField
          form={form}
          name="password"
          label="New password"
          type="password"
          autoComplete="new-password"
        />
        <ControlledTextField
          form={form}
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <Button type="submit" fullWidth variant="contained" loading={loading} disabled={tokenMissing}>
            Update password
          </Button>
        </Box>
      </form>
    </AuthLayout>
  );
}
