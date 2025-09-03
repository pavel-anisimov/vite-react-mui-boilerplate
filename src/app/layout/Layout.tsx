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
import { useMemo, useState} from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router-dom";

import type { MouseEvent, PropsWithChildren, JSX } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { useColorScheme } from "@/app/providers/ThemeProvider";
import UserMenu from "@/components/UserMenu";
import { LANG_TO_FLAG, SUPPORTED_LANGS, DEFAULT_LANGUAGE } from "@/i18n/langConfig"; // ⬅

const drawerWidth = 240;

/**
 * Represents a constant navigation structure used for application routing.
 *
 * Each navigation item includes:
 * - `to`: A string defining the route path.
 * - `labelKey`: A localized key for the navigation label.
 * - `icon`: A React component representing the icon for the navigation item.
 *
 * The navigation structure defines the following routes:
 * - The home route (`to: "/"`).
 * - The users route (`to: "/users"`).
 * - The forum route (`to: "/forum"`).
 *
 * The `as const` assertion ensures that the structure is immutable and the type is narrowed accordingly.
 */
const NAV = [
  { to: "/", labelKey: "nav.home", icon: <HomeIcon /> },
  { to: "/users", labelKey: "nav.users", icon: <PeopleIcon /> },
  { to: "/forum", labelKey: "nav.forum", icon: <ForumIcon /> },
] as const;

/**
 * The `Layout` component is a wrapper that provides structure and layout to the application.
 * It includes a responsive sidebar, header with language and theme toggles, and a main content area for rendering children components.
 *
 * @param {Object} props - The props passed to the `Layout` component.
 * @param {React.ReactNode} props.children - The children components to be rendered inside the main content area of the layout.
 * @return {JSX.Element} Returns a JSX element representing the layout structure of the application.
 */
export default function Layout({ children }: PropsWithChildren): React.JSX.Element | null {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!mdDown);
  const { scheme, toggle } = useColorScheme();
  const { t, i18n } = useTranslation("common");
  const loc = useLocation();

  const { accessToken, isLoading } = useAuth();
  const showSidebar = Boolean(accessToken);

  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const langOpen = Boolean(langAnchor);

  const handleLangClick = (event: MouseEvent<HTMLElement>) => setLangAnchor(event.currentTarget);
  const handleLangClose = () => setLangAnchor(null);

  /**
   * Asynchronously changes the application's language.
   *
   * @param {typeof SUPPORTED_LANGS[number]} lng - The target language to switch to.
   * It must be one of the supported languages defined in SUPPORTED_LANGS.
   *
   * The function updates the active language using the i18n library,
   * and subsequently handles any post-language-change operations
   * through the `handleLangClose` function.
   *
   * @returns {Promise<void>} A promise that resolves when the language change is complete
   * and subsequent operations have been handled.
   */
  const changeLang = async (lng: typeof SUPPORTED_LANGS[number]) => {
    await i18n.changeLanguage(lng);
    handleLangClose();
  };

  const currentTitle = useMemo(() => t("app.title"), [t]);
  const variant = mdDown ? "temporary" : "persistent";
  const drawerPaper = { width: drawerWidth, boxSizing: "border-box" };

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

  if (isLoading) {
    return null;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" color="primary" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {showSidebar && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setOpen((v) => !v)}
              aria-label={t("nav.toggleMenu")}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ flexGrow: 1, ml: showSidebar ? 1 : 0 }}>
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

          <IconButton color="inherit" onClick={toggle} aria-label={t("nav.toggleTheme")}>
            {scheme === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          <UserMenu />
        </Toolbar>
      </AppBar>

      {/* Sidebar for logged in users only */}
      {showSidebar && (
        <Drawer
          variant={variant}
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            ...(variant === "persistent"
              ? {
                width: 0, // root does not reserve space when closed
                flexShrink: 0,
                "& .MuiDrawer-paper": drawerPaper,
              }
              : {
                "& .MuiDrawer-paper": drawerPaper,
              }),
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: showSidebar && !mdDown && open ? `${drawerWidth}px` : 0,
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
