import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Link, Stack } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { JSX } from "react";

import { register as apiRegister, resendVerification } from "@/api/auth";
import AuthLayout from "@/components/AuthLayout";
import ControlledTextField from "@/components/form/ControlledTextField";

/**
 * Schema for validating user input.
 *
 * This schema validates the following fields:
 *
 * - `email`: The user's email address, which must be a valid email format.
 * - `password`: The user's password, which must:
 *   - Be at least 8 characters long.
 *   - Contain at least one numeric character.
 *   - Contain at least one uppercase letter.
 * - `confirmPassword`: A confirmation of the password, which must match the `password` field.
 *
 * If any of the conditions are not met, appropriate error messages will be returned:
 * - Email: "Invalid email" if the format is invalid.
 * - Password:
 *   - "Min 8 characters" if it does not meet the minimum length.
 *   - "Add a number" if it does not contain a numeric character.
 *   - "Add uppercase" if it does not contain an uppercase letter.
 * - Confirm Password: "Passwords do not match" if it does not match the `password` field.
 */
const schema = z
  .object({
    email: z.email({ message: "Invalid email" }),
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
 * A functional component that renders a sign-up form for creating a new account.
 * It includes fields for email, password, and confirm password.
 *
 * Submitting the form calls POST /auth/register on the gateway. Registration
 * does not return tokens and must NOT auto-login the user — on success the
 * form is replaced with a "check your email" confirmation and a link to Sign In.
 *
 * @constructor
 * @return {JSX.Element} A sign-up form component embedded in an authentication layout.
 */
export default function SignUp(): JSX.Element {
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Email the user registered with — kept for the resend-verification action.
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendResult, setResendResult] = useState<{ severity: "success" | "error"; text: string } | null>(null);

  /**
   * A function variable assigned to handle the form submission event. This function triggers
   * the form submission logic by validating and processing user input. It manages the state changes
   * for errors and loading indicators while attempting to register the user.
   *
   * On submission, it performs the following actions:
   * - Resets previous errors by setting the error state to `null`.
   * - Enables the loading state to indicate the ongoing process.
   * - Attempts to register the user using the provided email and password.
   * - On success, switches the page to a "check your email" confirmation state
   *   (no tokens are stored and no automatic sign-in is performed).
   * - Handles any errors encountered during the process, updating the error state with an appropriate message.
   * - Resets the loading state once the process is complete.
   */
  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);

    try {
      await apiRegister({ email: values.email, password: values.password });
      setRegisteredEmail(values.email);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  });

  /**
   * Requests another verification email for the address the user registered with.
   *
   * The gateway always answers with the same neutral message regardless of
   * whether the account exists, and that message is shown as-is — the UI must
   * not reveal account existence.
   */
  const handleResend = async (): Promise<void> => {
    if (!registeredEmail || resendLoading) return;
    setResendResult(null);
    setResendLoading(true);

    try {
      const { message } = await resendVerification({ email: registeredEmail });
      setResendResult({ severity: "success", text: message });
    } catch (caught: unknown) {
      setResendResult({
        severity: "error",
        text: caught instanceof Error ? caught.message : "Failed to resend verification email",
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (registeredEmail) {
    return (
      <AuthLayout title="Check your email" subtitle="One more step">
        <Alert severity="success" sx={{ mt: 1 }}>
          Registration accepted. Please check your email to verify your account.
        </Alert>
        {resendResult && (
          <Alert severity={resendResult.severity} sx={{ mt: 2 }}>
            {resendResult.text}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <Button href="/auth/sign-in" fullWidth variant="contained">
            Go to Sign In
          </Button>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Button fullWidth variant="text" onClick={handleResend} loading={resendLoading}>
            Resend verification email
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create account" subtitle="Join us in seconds">
      <form onSubmit={onSubmit} noValidate>
        <ControlledTextField form={form} name="email" label="Email" type="email" autoComplete="email" />
        <ControlledTextField form={form} name="password" label="Password" type="password" autoComplete="new-password" />
        <ControlledTextField
          form={form}
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
        />
        <Stack direction="row" sx={{ mt: 0.5, justifyContent: "flex-end" }}>
          <Link href="/auth/sign-in" underline="hover">
            Have an account? Sign in
          </Link>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <Button type="submit" fullWidth variant="contained" loading={loading}>
            Create account
          </Button>
        </Box>
      </form>
    </AuthLayout>
  );
}
