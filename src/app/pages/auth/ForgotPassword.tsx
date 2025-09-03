import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Alert, Box } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// import {useAuth} from "@/app/providers/AuthProvider";
import AuthLayout from "@/components/AuthLayout";
import ControlledTextField from "@/components/form/ControlledTextField";

const schema = z.object({
  email: z.email({ message: "Invalid email" }),
});
type Form = z.infer<typeof schema>;

export default function ForgotPassword() {
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  // const { signIn } = useAuth(); // there is no real challenge, just simulating success

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
