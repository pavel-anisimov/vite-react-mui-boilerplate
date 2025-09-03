import { Box, Container, Paper, Typography } from "@mui/material";

import type {JSX, ReactNode} from "react";

/**
 * AuthLayout is a layout component that provides a styled container for authentication-related screens or components.
 * It includes a title, an optional subtitle, and renders child components in a centered layout.
 *
 * @param {Object} props - The props object for the AuthLayout component.
 * @param {string} props.title - The main title displayed at the top of the layout.
 * @param {string} [props.subtitle] - An optional subtitle displayed below the title.
 * @param {ReactNode} props.children - The child components or elements to be rendered within the layout.
 * @return {JSX.Element} A layout container with a styled paper component and centered content.
 * @constructor
 */
export default function AuthLayout({
                                     title, subtitle, children,
                                   }: { title: string; subtitle?: string; children: ReactNode }): JSX.Element {
  return (
    <Container maxWidth="sm" sx={{ display: "grid", placeItems: "center", minHeight: "100dvh" }}>
      <Paper elevation={3} sx={{ p: 4, width: "100%", borderRadius: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {children}
      </Paper>
    </Container>
  );
}
