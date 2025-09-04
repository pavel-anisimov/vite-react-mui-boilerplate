import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { JSX } from "react";

import PageContainer from "@/components/PageContainer";

/**
 * A functional React component that represents the Home page.
 * It utilizes translations for the welcome message and subtitle.
 *
 * @constructor
 * @return {JSX.Element} The JSX structure for the Home page, including
 * typography elements displaying translated text wrapped within a container.
 */
export default function Home(): JSX.Element {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>{t("home.welcome")}</Typography>
      <Typography variant="body1">{t("home.subtitle")}</Typography>
    </PageContainer>
  );
}

