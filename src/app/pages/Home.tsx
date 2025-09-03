import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/PageContainer";

export default function Home() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>{t("home.welcome")}</Typography>
      <Typography variant="body1">{t("home.subtitle")}</Typography>
    </PageContainer>
  );
}

