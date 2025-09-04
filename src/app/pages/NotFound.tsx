import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { JSX } from "react";

import PageContainer from "@/components/PageContainer";

/**
 * NotFound is a functional React component that renders a page indicating that the requested resource was not found.
 * It utilizes translations for displaying localized text.
 *
 * @constructor
 *
 * @return {JSX.Element} The rendered JSX for the "Not Found" page, including a title and subtitle.
 */
export default function NotFound(): JSX.Element {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>{t("notfound.title")}</Typography>
      <Typography>{t("notfound.subtitle")}</Typography>
    </PageContainer>
  );
}

