import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/PageContainer";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>{t("notfound.title")}</Typography>
      <Typography>{t("notfound.subtitle")}</Typography>
    </PageContainer>
  );
}

