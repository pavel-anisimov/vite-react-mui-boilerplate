import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Alert, Box } from "@mui/material";
import { useState} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type {JSX} from "react";

// import {useAuth} from "@/app/providers/AuthProvider";
import AuthLayout from "@/components/AuthLayout";
import ControlledTextField from "@/components/form/ControlledTextField";

const schema = z.object({
  email: z.email({ message: "Invalid email" }),
});
type Form = z.infer<typeof schema>;

/**
 * ForgotPassword is a functional component that renders a password reset form.
 * It allows users to request a reset link by entering their email address. The component validates
 * the input, handles submission, and provides feedback to the user via alerts and loading state.
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

  /**
   * An asynchronous function assigned to handle form submission.
   * Executes a series of operations when the form is submitted, including setting loading states,
   * handling errors, and simulating sending a letter. Redirects the user upon success.
   *
   * This function:
   * - Resets any previous error state.
   * - Sets the loading state to true during the operation.
   * - Simulates an asynchronous request using a timeout.
   * - Redirects the user to the reset password confirmation page upon successful completion.
   * - Catches and processes errors, setting an error message if an issue occurred.
   * - Ensures the loading state is reset regardless of success or failure.
   */
  const onSubmit = form.handleSubmit(async () => {
    setError(null);
    setLoading(true);
    try {
      // Simulation of sending a letter
      await new Promise((resolve) => setTimeout(resolve, 400));
      window.location.replace("/auth/reset"); // if desired, go to the “check your email” page
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout title="Forgot password" subtitle="We'll email you a reset link">
      <form onSubmit={onSubmit} noValidate>
        <ControlledTextField form={form} name="email" label="Email" type="email" />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 2 }}>
          <LoadingButton type="submit" fullWidth variant="contained" loading={loading}>
            Send reset link
          </LoadingButton>
        </Box>
      </form>
    </AuthLayout>
  );
}
