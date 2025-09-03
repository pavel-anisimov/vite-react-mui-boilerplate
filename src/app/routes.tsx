import { lazy } from "react";

import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "@/app/routes/ProtectedRoute";

// 📌 lazy imports of public authentication pages
const SignIn = lazy(() => import("@/app/pages/auth/SignIn"));
const SignUp = lazy(() => import("@/app/pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("@/app/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/app/pages/auth/ResetPassword"));
// const VerifyEmail = lazy(() => import("@/app/pages/auth/VerifyEmail"));

// 📌 lazy imports of your current pages
const Home = lazy(() => import("@/app/pages/Home"));
const Users = lazy(() => import("@/app/pages/Users"));
const Forum = lazy(() => import("@/app/pages/Forum"));
const NotFound = lazy(() => import("@/app/pages/NotFound"));

export const routes: RouteObject[] = [
  // --- public auth ---
  { path: "/auth/sign-in", element: <SignIn /> },
  { path: "/auth/sign-up", element: <SignUp /> },
  { path: "/auth/forgot", element: <ForgotPassword /> },
  { path: "/auth/reset", element: <ResetPassword /> },
//  { path: "/auth/verify-email", element: <VerifyEmail /> },

  // --- protexted ---
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forum",
    element: (
      <ProtectedRoute>
        <Forum />
      </ProtectedRoute>
    ),
  },

  // --- fallback ---
  { path: "*", element: <NotFound /> },
];
