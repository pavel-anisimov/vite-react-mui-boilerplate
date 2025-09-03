// src/app/pages/auth/SignIn.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Alert, Box, Link, Stack } from "@mui/material";
import { useState} from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import AuthLayout from "../../../components/AuthLayout";
import ControlledTextField from "../../../components/form/ControlledTextField";
import { useAuth } from "../../providers/AuthProvider";

import type {JSX} from "react";

/**
 * Schema for user authentication input.
 *
 * This schema validates the structure of an object intended for authentication,
 * where an email and password are mandatory fields. Validation ensures the
 * email field contains a valid email address format and the password field
 * is a non-empty string.
 *
 * Properties:
 * - email: A valid email address. Returns a custom error message "Invalid email" if invalid.
 * - password: A non-empty string. Returns a custom error message "Password is required" if empty.
 */
const schema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z.string().min(1, "Password is required"),
});
type Form = z.infer<typeof schema>;

/**
 * Extracts an error message from the provided error object when possible.
 *
 * @param {unknown} error - The error object to extract the message from. This could be any unknown type.
 * @return {string} The extracted error message if available, otherwise a default error message is returned.
 */
function getErrorMessage(error: unknown): string {
  // Пытаемся достать сообщение из ответа бэка (axios)
  if (typeof error === "object" && error !== null) {
    const anyError = error as any;
    const message =
      anyError?.response?.data?.message ??
      anyError?.response?.data?.error ??
      anyError?.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Failed to sign in";
}

/**
 * Renders the SignIn component which provides a login form for users.
 * The form includes fields for email and password and handles authentication logic.
 * Redirects users to a specified path upon successful login or displays an error message upon failure.
 *
 * @constructor
 * @return {JSX.Element} The SignIn component containing the login form and related elements.
 */
export default function SignIn(): JSX.Element {
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as never;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // приоритет: state.from (защищённый редирект) → ?next= → "/"
  const nextFromState = location?.state?.from?.pathname as string | undefined;
  const nextFromQuery = new URLSearchParams(window.location.search).get("next") || undefined;
  const redirectTo = nextFromState || nextFromQuery || "/";

  /**
   * Handles the submission of a form and manages state changes during the process.
   * Invokes the `signIn` method with the provided email and password from form values.
   * Redirects to the specified route upon success or sets an error message upon failure.
   * Manages loading state and error state to provide feedback to the user.
   *
   * @type {function} Form submission handler function.
   */
  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      // используем клиентский роутинг вместо window.location.replace
      await navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back">
      <form onSubmit={onSubmit} noValidate>
        <ControlledTextField form={form} name="email" label="Email" type="email" autoFocus />
        <ControlledTextField form={form} name="password" label="Password" type="password" />
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
          <Link href="/auth/forgot" underline="hover">
            Forgot password?
          </Link>
          <Link href="/auth/sign-up" underline="hover">
            Create account
          </Link>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <LoadingButton type="submit" fullWidth variant="contained" loading={loading}>
            Sign in
          </LoadingButton>
        </Box>
      </form>
    </AuthLayout>
  );
}
