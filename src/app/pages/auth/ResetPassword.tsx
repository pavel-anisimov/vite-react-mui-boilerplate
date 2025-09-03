import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Alert, Box } from "@mui/material";
import { useMemo, useState} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type {JSX} from "react";

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
 * Handles the password reset functionality by validating input, interacting with the form,
 * and redirecting the user upon successful update. Displays an alert for missing tokens
 * or any errors that may occur during the process. This function uses a token from
 * the URL query parameters for authorization.
 *
 * @constructor
 * @return {JSX.Element} A React component that renders the password reset form including
 * fields for new password, confirm password, and appropriate error or loading states.
 */
export default function ResetPassword(): JSX.Element {
  const token = useMemo(() => new URL(window.location.href).searchParams.get("token") || "", []);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tokenMissing = token.length === 0;

  /**
   * Event handler function for form submission.
   *
   * This variable represents a submission handler for a form. When triggered,
   * it executes an asynchronous function designed for handling form submission,
   * including resetting application state, performing simulated operations, and
   * finally redirecting upon success or showing error messages upon failure.
   *
   * Functional Details:
   * - Clears any previous error state by setting error to null.
   * - Sets a loading state to true to indicate processing.
   * - Executes a simulated asynchronous operation with a delay of 400ms.
   * - On successful operation, redirects the user to a specified URL (/auth/sign-in)
   *   with a success message.
   * - On error, captures and sets the caught error message; defaults to a specific
   *   message if not an instance of Error.
   * - Ensures that the loading state is reset to false after the operation is completed.
   */
  const onSubmit = form.handleSubmit(async () => {
    setError(null);
    setLoading(true);

    try {
      // simulation
      await new Promise((resolve) => setTimeout(resolve, 400));
      window.location.replace("/auth/sign-in?msg=reset-success");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password">
      {tokenMissing && (
        <Alert severity="warning" sx={{ mb: 2 }}>
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
          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            loading={loading}
            disabled={tokenMissing}
          >
            Update password
          </LoadingButton>
        </Box>
      </form>
    </AuthLayout>
  );
}
