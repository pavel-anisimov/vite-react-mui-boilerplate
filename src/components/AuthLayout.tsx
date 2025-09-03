import { Box, Container, Paper, Typography } from "@mui/material";

import type { ReactNode } from "react";

export default function AuthLayout({
                                     title, subtitle, children,
                                   }: { title: string; subtitle?: string; children: ReactNode }) {
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
