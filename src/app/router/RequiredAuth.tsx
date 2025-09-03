// src/app/router/RequireAuth.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

/**
 * A higher-order component that restricts access to specific parts of the application
 * based on the user's authentication status. If the user is not authenticated,
 * they are redirected to the login route.
 *
 * @typedef {React.FC} RequireAuth
 * @param {Object} props - React component props.
 * @param {React.ReactNode} props.children - The child components to be rendered
 *                                           if the user is authenticated.
 * @returns {React.ReactNode} - Returns the children if the user is authenticated,
 *                              otherwise navigates to the login page.
 * @constructor
 */
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
