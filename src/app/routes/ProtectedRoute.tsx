// src/app/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

type Properties = { children: React.ReactNode };

/**
 * A component that protects routes by checking the authentication state of the user.
 * Redirects unauthenticated users to the login page.
 * Displays nothing while the authentication state is loading.
 *
 * @param {object} props The component props.
 * @param {React.ReactNode} props.children The child components to render if the user is authenticated.
 * @return {React.ReactNode|null} The children components if the user is authenticated,
 *                                a redirect to the login page if not authenticated,
 *                                or null while loading authentication state.
 * @constructor
 */
export default function ProtectedRoute({ children }: Properties): React.ReactNode | null {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
