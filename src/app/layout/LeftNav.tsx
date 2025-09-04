import ForumIcon from "@mui/icons-material/Forum";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import {
  Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router-dom";

export const DRAWER_WIDTH = 240 as const;

const NAV = [
  { to: "/", labelKey: "nav.home", icon: <HomeIcon /> },
  { to: "/users", labelKey: "nav.users", icon: <PeopleIcon /> },
  { to: "/forum", labelKey: "nav.forum", icon: <ForumIcon /> },
] as const;

type SideNavProps = {
  open: boolean;
  onClose: () => void;
  variant: "temporary" | "persistent";
  mdDown: boolean;
  canSeeUsers: boolean;
};

/**
 * Renders the SideNav component, which is a navigational drawer for displaying menu items.
 *
 * @param {Object} props The component props.
 * @param {boolean} props.open Indicates whether the drawer is open.
 * @param {Function} props.onClose Callback function invoked when the drawer is closed.
 * @param {string} props.variant Specifies the variant of the drawer (e.g., "persistent", "temporary").
 * @param {boolean} props.mdDown A flag indicating if the screen size matches the medium-down breakpoint.
 * @param {boolean} props.canSeeUsers Specifies if the user's menu item should be visible.
 *
 * @return {JSX.Element} Returns the rendered SideNav component.
 * @constructor
 */
export default function SideNav({
                                  open, onClose, variant, mdDown, canSeeUsers,
                                }: SideNavProps) {
  const { t } = useTranslation("common");
  const loc = useLocation();

  const drawerPaper = { width: DRAWER_WIDTH, boxSizing: "border-box" };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        ...(variant === "persistent"
          ? {
            width: 0,
            flexShrink: 0,
            "& .MuiDrawer-paper": drawerPaper,
          }
          : {
            "& .MuiDrawer-paper": drawerPaper,
          }),
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {NAV
          .filter((item) => item.to !== "/users" || canSeeUsers)
          .map((item) => (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={loc.pathname === item.to}
              onClick={() => mdDown && onClose()}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.labelKey)} />
            </ListItemButton>
          ))}
      </List>
    </Drawer>
  );
}
