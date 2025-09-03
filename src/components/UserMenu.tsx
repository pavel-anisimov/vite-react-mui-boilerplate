import { Logout, Settings, Person } from "@mui/icons-material";
import {
  Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography,
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

function initials(nameOrEmail?: string) {
  if (!nameOrEmail) return "U";
  const base = nameOrEmail.trim();
  const at = base.indexOf("@");
  const name = at > 0 ? base.slice(0, at) : base;
  const parts = name.split(/\s+/);
  const first = parts[0]?.[0];
  const second = parts[1]?.[0];
  return (first ?? "U").toUpperCase() + (second?.toUpperCase() ?? "");
}

export default function UserMenu() {
  const { user, isLoading, signOut, accessToken } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  if (isLoading) return null;

  // If the user is not logged in, we will show quick actions
  if (!accessToken) {
    return (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Typography
          variant="body2"
          component="a"
          href="/auth/sign-in"
          style={{ textDecoration: "none" }}
        >
          Sign in
        </Typography>
        <Typography
          variant="body2"
          component="a"
          href="/auth/sign-up"
          style={{ textDecoration: "none" }}
        >
          Sign up
        </Typography>
      </Box>
    );
  }

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleClose();
    navigate("/profile"); // we will create a profile page later
  };
  const handleSettings = () => {
    handleClose();
    navigate("/settings"); // we will create it later «Account Settings»
  };
  const handleSignOut = async () => {
    handleClose();
    await signOut();
    navigate("/auth/sign-in");
  };

  const label = user?.name || user?.email || "User";

  return (
    <>
      <Tooltip title="Account">
        <IconButton onClick={handleOpen} size="small" sx={{ ml: 1 }} aria-controls={open ? "account-menu" : undefined} aria-haspopup="true" aria-expanded={open ? "true" : undefined}>
          <Avatar sx={{ width: 32, height: 32 }}>{initials(user?.name || user?.email)}</Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, minWidth: 220, "& .MuiMenuItem-root": { py: 1 } },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2">{label}</Typography>
          {user?.roles?.length ? (
            <Typography variant="caption" color="text.secondary">
              {user.roles.join(", ")}
            </Typography>
          ) : null}
        </Box>
        <Divider />
        <MenuItem onClick={handleProfile}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>
          My profile
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}
