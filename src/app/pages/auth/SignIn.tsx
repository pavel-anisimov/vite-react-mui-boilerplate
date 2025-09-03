// src/app/pages/auth/SignIn.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Alert, Box, Link, Stack } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../../components/AuthLayout";
import ControlledTextField from "../../../components/form/ControlledTextField";
import { useAuth } from "../../providers/AuthProvider";

const schema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(1, "Password is required"),
});
type Form = z.infer<typeof schema>;

function getErrorMessage(err: unknown): string {
  // Пытаемся достать сообщение из ответа бэка (axios)
  if (typeof err === "object" && err !== null) {
    const anyErr = err as any;
    const msg =
      anyErr?.response?.data?.message ??
      anyErr?.response?.data?.error ??
      anyErr?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return "Failed to sign in";
}

export default function SignIn() {
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // приоритет: state.from (защищённый редирект) → ?next= → "/"
  const nextFromState = location?.state?.from?.pathname as string | undefined;
  const nextFromQuery = new URLSearchParams(window.location.search).get("next") || undefined;
  const redirectTo = nextFromState || nextFromQuery || "/";

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      // используем клиентский роутинг вместо window.location.replace
      navigate(redirectTo, { replace: true });
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
