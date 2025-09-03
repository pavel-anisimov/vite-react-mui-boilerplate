import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Alert, Box } from "@mui/material";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import AuthLayout from "@/components/AuthLayout";
import ControlledTextField from "@/components/form/ControlledTextField";

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

export default function ResetPassword() {
  const token = useMemo(() => new URL(window.location.href).searchParams.get("token") || "", []);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tokenMissing = token.length === 0;

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
