import CheckIcon from "@mui/icons-material/Check";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import TranslateIcon from "@mui/icons-material/Translate";
import {
  AppBar, Box, IconButton, ListItemIcon, Menu, MenuItem, Toolbar, Typography,
} from "@mui/material";
import React, { JSX } from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";

import { useColorScheme } from "@/app/providers/ThemeProvider";
import UserMenu from "@/components/UserMenu";
import { DEFAULT_LANGUAGE, LANG_TO_FLAG, SUPPORTED_LANGS } from "@/i18n/langConfig";

type AppTopBarProps = {
  showSidebar: boolean;
  onToggleSidebar: () => void;
};

/**
 * Renders the application's top bar, including navigation controls, theme toggler, language switcher, and user menu.
 *
 * @param {Object} props - The component properties.
 * @param {boolean} props.showSidebar - Determines whether the sidebar toggle button should be displayed.
 * @param {Function} props.onToggleSidebar - Function to execute when the sidebar toggle button is clicked.
 *
 * @return {JSX.Element} The rendered top bar component.
 * @constructor
 */
export default function AppTopBar({ showSidebar, onToggleSidebar }: AppTopBarProps): JSX.Element {
  const { t, i18n } = useTranslation("common");
  const { scheme, toggle } = useColorScheme();

  const [langAnchor, setLangAnchor] = React.useState<null | HTMLElement>(null);
  const langOpen = Boolean(langAnchor);
  const handleLangClick = (e: React.MouseEvent<HTMLElement>) => setLangAnchor(e.currentTarget);
  const handleLangClose = () => setLangAnchor(null);
  const changeLang = async (lng: (typeof SUPPORTED_LANGS)[number]) => {
    await i18n.changeLanguage(lng);
    handleLangClose();
  };

  return (
    <AppBar position="fixed" color="primary" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar>
        {showSidebar && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onToggleSidebar}
            aria-label={t("nav.toggleMenu")}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ flexGrow: 1, ml: showSidebar ? 1 : 0 }}>
          {t("app.title")}
        </Typography>

        {/* Language */}
        <IconButton color="inherit" aria-label={t("nav.language")} onClick={handleLangClick} sx={{ mr: 1 }}>
          <TranslateIcon />
        </IconButton>
        <Menu
          anchorEl={langAnchor}
          open={langOpen}
          onClose={handleLangClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {SUPPORTED_LANGS.map((lng) => {
            const selected = i18n.language.startsWith(lng);
            const flagCode = LANG_TO_FLAG.get(lng) ?? DEFAULT_LANGUAGE;
            return (
              <MenuItem key={lng} onClick={() => void changeLang(lng)} selected={selected}>
                <ListItemIcon>
                  <ReactCountryFlag
                    countryCode={flagCode}
                    svg
                    style={{ width: "1.25em", height: "1.25em", borderRadius: 2 }}
                    aria-label={t(`nav.lang.${lng}`)}
                  />
                </ListItemIcon>
                {t(`nav.lang.${lng}`)}
                {selected && (
                  <Box component="span" sx={{ ml: "auto", display: "inline-flex" }}>
                    <CheckIcon fontSize="small" />
                  </Box>
                )}
              </MenuItem>
            );
          })}
        </Menu>

        {/* Theme */}
        <IconButton color="inherit" onClick={toggle} aria-label={t("nav.toggleTheme")}>
          {scheme === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        <UserMenu />
      </Toolbar>
    </AppBar>
  );
}
