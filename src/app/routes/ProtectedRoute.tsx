// src/app/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, LinearProgress } from "@mui/material";

import { useAuth } from "@/app/providers/AuthProvider";

type Properties = {
  children: React.ReactNode;
  /** Allowed roles (any from the list is enough). Absence means it is enough to be logged in. */
  roles?: readonly string[];
};

export default function ProtectedRoute({ children, roles }: Properties): React.ReactNode | null {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // While loading the auth state, we show a simple indicator (so that there is no emptiness)
  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  // Not logged in → on sign-in, with return after login
  if (!user) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;
  }

  // Если указаны роли — проверяем, что есть хотя бы одна совпадающая
  if (roles && roles.length > 0) {
    const have = (user.roles ?? []).map((r) => r.toLowerCase());
    const need = roles.map((r) => r.toLowerCase());
    const allowed = need.some((r) => have.includes(r));
    if (!allowed) {
      // no access → to the main page (or we will do /403 if desired)
      return <Navigate to="/" replace state={{ forbidden: true }} />;
    }
  }

  return <>{children}</>;
}
