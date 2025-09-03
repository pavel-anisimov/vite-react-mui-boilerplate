import { Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/PageContainer";

export default function Forum() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>{t("forum.title")}</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2">Forum module placeholder. Add threads & posts later.</Typography>
      </Paper>
    </PageContainer>
  );
}

