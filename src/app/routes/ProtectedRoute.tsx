// src/app/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

type Props = { children: React.ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuth();

  // until we know the state, we don't render anything (a spinner is possible)
  if (isLoading) return null;

  // no user - send to login page
  if (!user) {
    const location = useLocation();
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
