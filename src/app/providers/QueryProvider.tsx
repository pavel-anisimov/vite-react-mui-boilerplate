import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { PropsWithChildren } from "react";

import type { JSX } from "react";

const client = new QueryClient();

/**
 * Provides the QueryClient context to its children, enabling them to use React Query functionalities.
 * Additionally, includes the React Query Devtools in development mode.
 *
 * @param {object} props - The properties passed to the provider component.
 * @param {React.ReactNode} props.children - The child components that will have access to the QueryClient context.
 * @return {JSX.Element} The provider component rendering the children within the QueryClientProvider.
 *
 * @constructor
 */
export function AppQueryProvider({ children }: PropsWithChildren): JSX.Element {
  return (
    <QueryClientProvider client={client}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

