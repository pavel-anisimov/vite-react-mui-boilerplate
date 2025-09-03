import { Container } from "@mui/material";

import type {JSX, PropsWithChildren} from "react";

/**
 * A component that serves as a wrapper for page content, providing consistent styling and layout adjustments.
 *
 * @param {object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The content or components to be rendered inside the PageContainer.
 * @return {JSX.Element} The rendered `Container` component with custom styles applied.
 * @constructor
 */
export default function PageContainer({ children }: PropsWithChildren): JSX.Element {
  return (
    <Container sx={{ py: 3 }} maxWidth="lg">{children}</Container>
  );
}

