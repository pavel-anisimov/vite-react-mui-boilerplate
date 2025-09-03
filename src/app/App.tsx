import { LinearProgress } from "@mui/material";
import { Suspense } from "react";
import { useRoutes } from "react-router-dom";

import { routes } from "./routes";

export default function App() {
  const element = useRoutes(routes);

  return <Suspense fallback={<LinearProgress />}>{element}</Suspense>;
}
