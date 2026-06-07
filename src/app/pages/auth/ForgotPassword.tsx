import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Link, Stack } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { JSX } from "react";

import { forgotPassword } from "@/api/auth";
import AuthLayout from "@/components/AuthLayout";
import ControlledTextField from "@/components/form/ControlledTextField";

const schema = z.object({
  email: z.email({ message: "Invalid email" }),
});
type Form = z.infer<typeof schema>;

/**
 * ForgotPassword is a functional component that renders a password reset form.
 * It allows users to request a reset link by entering their email address.
 *
 * Submitting the form calls POST /auth/forgot-password on the gateway. The
 * gateway always answers with the same neutral message regardless of whether
 * the account exists, and that message is shown as-is — the UI must not
 * reveal account existence.
 *
 * @return {JSX.Element} The rendered Forgot Password form component.
 */
export default function ForgotPassword(): JSX.Element {
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * An asynchronous function assigned to handle form submission.
   *
   * This function:
   * - Resets any previous error state.
   * - Sets the loading state to true during the operation.
   * - Submits the email to the gateway's forgot-password endpoint.
   * - On success, replaces the form with the neutral acknowledgement message from the API.
   * - Catches and processes errors, setting an error message if an issue occurred.
   * - Ensures the loading state is reset regardless of success or failure.
   */
  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      const { message } = await forgotPassword({ email: values.email });
      setSuccessMessage(message);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  });

  if (successMessage) {
    return (
      <AuthLayout title="Check your email" subtitle="Reset link requested">
        <Alert severity="success" sx={{ mt: 1 }}>
          {successMessage}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button href="/auth/sign-in" fullWidth variant="contained">
            Back to Sign In
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password" subtitle="We'll email you a reset link">
      <form onSubmit={onSubmit} noValidate>
        <ControlledTextField form={form} name="email" label="Email" type="email" />
        <Stack direction="row" sx={{ mt: 0.5, justifyContent: "flex-end" }}>
          <Link href="/auth/sign-in" underline="hover">
            Back to Sign In
          </Link>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <Button type="submit" fullWidth variant="contained" loading={loading}>
            Send reset link
          </Button>
        </Box>
      </form>
    </AuthLayout>
  );
}
