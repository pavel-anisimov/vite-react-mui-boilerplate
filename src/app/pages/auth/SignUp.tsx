import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Alert, Box, Link, Stack } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/app/providers/AuthProvider";
import AuthLayout from "@/components/AuthLayout";
import ControlledTextField from "@/components/form/ControlledTextField";

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

export default function SignUp() {
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
