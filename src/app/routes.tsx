import { lazy } from "react";

import { Navigate } from "react-router-dom";

import type { RouteObject } from "react-router-dom";

import Layout from "@/app/layout/Layout";
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
const MyProfilePage = lazy(() => import("@/app/pages/profile/Profile"));
const PublicUserProfilePage = lazy(() => import("@/app/pages/profile/PublicUserProfilePage"));
const AdminUserProfilePage = lazy(() => import("@/app/pages/profile/AdminUserProfilePage"));
const NotFound = lazy(() => import("@/app/pages/NotFound"));

/**
 * Array of route objects defining the application routing structure.
 *
 * Each object in the array represents a route configuration, specifying
 * the URL path and the associated React component to render for that path.
 *
 * @type {RouteObject[]}
 * @property {string} path - The URL path for the route.
 * @property {React.Element} element - React element to render for this route.
 * @property {RouteObject[]} [children] - Optional nested routes for creating
 *                                        hierarchical routing structure.
 *
 * Routes:
 * 1. Public Authentication routes:
 *    - "/auth/sign-in": SignIn component
 *    - "/auth/sign-up": SignUp component
 *    - "/auth/forgot": ForgotPassword component
 *    - "/auth/reset": ResetPassword component
 *
 * 2. Private routes with layout:
 *    - "/": Protected route with Layout as the top-level component
 *      - Nested routes:
 *         - Home (index route)
 *         - "/users": Users component
 *         - "/forum": Forum component
 *
 * 3. Catch-all route:
 *    - "*": NotFound component, handles unmatched paths.
 */
export const routes: RouteObject[] = [
  // public auth
  { path: "/auth/sign-in", element: <SignIn /> },
  { path: "/auth/sign-up", element: <SignUp /> },
  { path: "/auth/forgot", element: <ForgotPassword /> },
  { path: "/auth/reset", element: <ResetPassword /> },

  // private + layout by one node
  {
    path: "/",
    element: <Layout />,
    children: [
      // Home — public
      { index: true, element: <Home /> },
      // Forum — signed-in users only
      {
        path: "forum",
        element: (
          <ProtectedRoute>
            <Forum />
          </ProtectedRoute>
        ),
      },
      // Users — admin or manager only
      {
        path: "users",
        element: (
          <ProtectedRoute roles={["admin", "manager"]}>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: <Navigate to="/me/profile" replace />,
      },
      {
        path: "me/profile",
        element: (
          <ProtectedRoute>
            <MyProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "users/:id/profile",
        element: (
          <ProtectedRoute>
            <PublicUserProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/users/:id/profile",
        element: (
          <ProtectedRoute roles={["admin", "manager"]}>
            <AdminUserProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  { path: "*", element: <NotFound /> },
];
