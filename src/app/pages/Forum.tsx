import { Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import type {JSX} from "react";

import PageContainer from "@/components/PageContainer";

/**
 * Represents a Forum component that serves as a placeholder for forum-related functionality.
 * It displays a title and a placeholder message for threads and posts.
 *
 * @constructor
 * @return {JSX.Element} The rendered Forum component containing a title and placeholder content.
 */
export default function Forum(): JSX.Element {
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

