import { Container } from "@mui/material";

import type { PropsWithChildren } from "react";

export default function PageContainer({ children }: PropsWithChildren) {
  return (
    <Container sx={{ py: 3 }} maxWidth="lg">{children}</Container>
  );
}

