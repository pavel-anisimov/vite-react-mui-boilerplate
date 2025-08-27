import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CheckIcon from "@mui/icons-material/Check";
import ForumIcon from "@mui/icons-material/Forum";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import TranslateIcon from "@mui/icons-material/Translate";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router-dom";

import type { MouseEvent, PropsWithChildren } from "react";

import { useColorScheme } from "@/app/providers/ThemeProvider";

const drawerWidth = 240;

const NAV = [
  { to: "/", labelKey: "nav.home", icon: <HomeIcon /> },
  { to: "/users", labelKey: "nav.users", icon: <PeopleIcon /> },
  { to: "/forum", labelKey: "nav.forum", icon: <ForumIcon /> },
] as const;

const LANG_TO_FLAG = new Map<"en" | "ru" | "pl", string>([
  ["en", "US"], // or "GB"
  ["ru", "RU"],
  ["pl", "PL"],
]);

export default function Layout({ children }: PropsWithChildren) {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!mdDown);
  const { scheme, toggle } = useColorScheme();
  const { t, i18n } = useTranslation("common");
  const loc = useLocation();

  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const langOpen = Boolean(langAnchor);

  const handleLangClick = (event: MouseEvent<HTMLElement>) => setLangAnchor(event.currentTarget);
  const handleLangClose = () => setLangAnchor(null);

  const changeLang = async (lng: "en" | "ru" | "pl") => {
    await i18n.changeLanguage(lng); // satisfy no-floating-promises with await
    handleLangClose();
  };

  const currentTitle = useMemo(() => t("app.title"), [t]);
  const variant = mdDown ? "temporary" : "persistent";

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {NAV.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={loc.pathname === item.to}
            onClick={() => mdDown && setOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={t(item.labelKey)} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" color="primary" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("nav.toggleMenu")}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
            {currentTitle}
          </Typography>

          {/* Language dropdown trigger */}
          <IconButton
            color="inherit"
            aria-label={t("nav.language")}
            onClick={handleLangClick}
            sx={{ mr: 1 }}
          >
            <TranslateIcon />
          </IconButton>

          {/* Language dropdown menu */}
          <Menu
            anchorEl={langAnchor}
            open={langOpen}
            onClose={handleLangClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {(["en", "ru", "pl"] as const).map((lng) => {
              const selected = i18n.language.startsWith(lng);
              const flagCode = LANG_TO_FLAG.get(lng) ?? "US";
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

          <IconButton color="inherit" onClick={toggle} aria-label={t("nav.toggleTheme")}>
            {scheme === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={variant}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: !mdDown && open ? `${drawerWidth}px` : 0,
          transition: (t) =>
            t.transitions.create(["margin"], {
              duration: t.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
