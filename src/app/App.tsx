import { LinearProgress } from "@mui/material";
import { Suspense} from "react";
import { useRoutes } from "react-router-dom";

import { routes } from "./routes";

import type {JSX} from "react";

/**
 * The App component initializes the application's routing system and wraps the routes
 * with a Suspense component to handle asynchronous loading states. It dynamically renders
 * components based on the provided route configuration.
 *
 * @return {JSX.Element} A JSX element that renders the application's routes within
 * a Suspense component with a fallback UI (LinearProgress) for loading states.
 * @constructor
 */
export default function App(): JSX.Element {
  const element = useRoutes(routes);

  return <Suspense fallback={<LinearProgress />}>{element}</Suspense>;
}
