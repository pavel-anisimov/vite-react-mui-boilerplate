import { lazy } from "react";

import type { RouteObject } from "react-router-dom";

const Home = lazy(() => import("@/app/pages/Home"));
const Users = lazy(() => import("@/app/pages/Users"));
const Forum = lazy(() => import("@/app/pages/Forum"));
const NotFound = lazy(() => import("@/app/pages/NotFound"));

export const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/users", element: <Users /> },
  { path: "/forum", element: <Forum /> },
  { path: "*", element: <NotFound /> }
];

