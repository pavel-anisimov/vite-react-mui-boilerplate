import { Box, CssBaseline, Toolbar, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { JSX } from "react";
import { Outlet } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import AppTopBar from "@/app/layout/AppTopBar";
import SideNav, { DRAWER_WIDTH } from "@/app/layout/LeftNav";

/**
 * The Layout component manages the main layout structure and behavior of the application, including the top bar, sidebar,
 * and main content area. It dynamically adjusts based on the viewport size and user authentication state.
 *
 * @return {JSX.Element | null} The rendered layout component or null if the application is still loading.
 * @constructor
 */
export default function Layout(): JSX.Element | null {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

  const { user, accessToken, isLoading } = useAuth();
  const showSidebar = Boolean(accessToken);

  const [open, setOpen] = React.useState(!mdDown);
  React.useEffect(() => setOpen(!mdDown), [mdDown]);

  const variant: "temporary" | "persistent" = mdDown ? "temporary" : "persistent";

  const canSeeUsers = React.useMemo(() => {
    const roles = (user?.roles ?? []).map((role) => role.toLowerCase());
    return roles.includes("admin") || roles.includes("manager");
  }, [user?.roles]);

  if (isLoading) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppTopBar
        showSidebar={showSidebar}
        onToggleSidebar={() => setOpen((v) => !v)}
      />

      {showSidebar && (
        <SideNav
          open={open}
          onClose={() => setOpen(false)}
          variant={variant}
          mdDown={mdDown}
          canSeeUsers={canSeeUsers}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: showSidebar && !mdDown && open ? `${DRAWER_WIDTH}px` : 0,
          transition: (t) =>
            t.transitions.create(["margin"], {
              duration: t.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
