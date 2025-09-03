import { AccountCircle, Logout, Person, Settings, Login, PersonAdd } from "@mui/icons-material";
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

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSignIn = () => { handleClose(); navigate("/auth/sign-in"); };
  const handleSignUp = () => { handleClose(); navigate("/auth/sign-up"); };
  const handleProfile = () => { handleClose(); navigate("/profile"); };
  const handleSettings = () => { handleClose(); navigate("/settings"); };
  const handleSignOut = async () => { handleClose(); await signOut(); navigate("/auth/sign-in"); };

  const label = user?.name || user?.email || "User";

  const Trigger = accessToken
    ? <Avatar sx={{ width: 32, height: 32 }}>{initials(label)}</Avatar>
    : <AccountCircle fontSize="large" />;

  return (
    <>
      <Tooltip title="Account">
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{ ml: 1 }}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          {Trigger}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 220, "& .MuiMenuItem-root": { py: 1 } } }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {accessToken ? (
          <>
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
          </>
        ) : (
          <>
            <MenuItem onClick={handleSignIn}>
              <ListItemIcon><Login fontSize="small" /></ListItemIcon>
              Sign in
            </MenuItem>
            <MenuItem onClick={handleSignUp}>
              <ListItemIcon><PersonAdd fontSize="small" /></ListItemIcon>
              Sign up
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}
