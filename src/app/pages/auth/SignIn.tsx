import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Alert, Box, Link, Stack } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import AuthLayout from "../../../components/AuthLayout";
import ControlledTextField from "../../../components/form/ControlledTextField";
import { useAuth } from "../../providers/AuthProvider";

const schema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z.string().min(1, "Password is required"),
});
type Form = z.infer<typeof schema>;

export default function SignIn() {
  const form = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.replace(next || "/");
    } catch (error_: unknown) {
      setError(error_ instanceof Error ? error_.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back">
      <form onSubmit={onSubmit} noValidate>
        <ControlledTextField form={form} name="email" label="Email" type="email" />
        <ControlledTextField form={form} name="password" label="Password" type="password" />
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
          <Link href="/auth/forgot" underline="hover">Forgot password?</Link>
          <Link href="/auth/sign-up" underline="hover">Create account</Link>
        </Stack>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 2 }}>
          <LoadingButton type="submit" fullWidth variant="contained" loading={loading}>Sign in</LoadingButton>
        </Box>
      </form>
    </AuthLayout>
  );
}
