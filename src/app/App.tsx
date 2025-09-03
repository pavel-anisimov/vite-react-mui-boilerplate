import { LinearProgress } from "@mui/material";
import { Suspense } from "react";
import { useRoutes } from "react-router-dom";

import { routes } from "./routes";

import Layout from "@/app/layout/Layout";

export default function App() {
  const element = useRoutes(routes);
  return (
    <Layout>
      <Suspense fallback={<LinearProgress />}>{element}</Suspense>
    </Layout>
  );
}
