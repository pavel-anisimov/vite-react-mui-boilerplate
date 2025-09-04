import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Alert, Box, Link, Stack } from "@mui/material";
import { useState} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { JSX } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import AuthLayout from "@/components/AuthLayout";
import ControlledTextField from "@/components/form/ControlledTextField";

/**
 * Schema for validating user input.
 *
 * This schema validates the following fields:
 *
 * - `name`: The user's name, which must be a string with at least 2 characters.
 * - `email`: The user's email address, which must be a valid email format.
 * - `password`: The user's password, which must:
 *   - Be at least 8 characters long.
 *   - Contain at least one numeric character.
 *   - Contain at least one uppercase letter.
 * - `confirmPassword`: A confirmation of the password, which must match the `password` field.
 *
 * If any of the conditions are not met, appropriate error messages will be returned:
 * - Name: "Enter your name" if it does not meet the minimum length.
 * - Email: "Invalid email" if the format is invalid.
 * - Password:
 *   - "Min 8 characters" if it does not meet the minimum length.
 *   - "Add a number" if it does not contain a numeric character.
 *   - "Add an uppercase" if it does not contain an uppercase letter.
 * - Confirm Password: "Passwords do not match" if it does not match the `password` field.
 */
const schema = z
  .object({
    name: z.string().min(2, { message: "Enter your name" }),
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
 * It includes fields for full name, email, password, and confirm password.
 * Handles form submission, user authentication, and displays error messages if sign-up fails.
 *
 * @constructor
 * @return {JSX.Element} A sign-up form component embedded in an authentication layout.
 */
export default function SignUp(): JSX.Element {
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * A function variable assigned to handle the form submission event. This function triggers
   * the form submission logic by validating and processing user input. It manages the state changes
   * for errors and loading indicators while attempting to sign up the user.
   *
   * On submission, it performs the following actions:
   * - Resets previous errors by setting the error state to `null`.
   * - Enables the loading state to indicate the ongoing process.
   * - Attempts to register the user using the provided email, password, and name.
   * - Redirects the user to the sign-in page with a query parameter prompting email verification upon successful registration.
   * - Handles any errors encountered during the process, updating the error state with an appropriate message.
   * - Resets the loading state once the process is complete.
   */
  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);

    try {
      await signUp(values.email, values.password, values.name);
      window.location.replace("/auth/sign-in?msg=verify-email");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout title="Create account" subtitle="Join us in seconds">
      <form onSubmit={onSubmit} noValidate>
        <ControlledTextField form={form} name="name" label="Full name" autoComplete="name" />
        <ControlledTextField form={form} name="email" label="Email" type="email" autoComplete="email" />
        <ControlledTextField form={form} name="password" label="Password" type="password" autoComplete="new-password" />
        <ControlledTextField form={form} name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" />
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
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
          <LoadingButton type="submit" fullWidth variant="contained" loading={loading}>
            Create account
          </LoadingButton>
        </Box>
      </form>
    </AuthLayout>
  );
}
