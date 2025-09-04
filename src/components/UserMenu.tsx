import { AccountCircle, Logout, Person, Settings, Login, PersonAdd } from "@mui/icons-material";
import {
  Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography,
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

/**
 * Generates initials from a given name or email address.
 *
 * If a name or email is not provided, returns "U".
 * For names, it extracts the first letter from the first two words (if available).
 * For email addresses, it uses the part before the "@" symbol as the name.
 *
 * @param {string} [nameOrEmail] - The name or email address to generate initials from.
 * @return {string} The generated initials, or "U" if the input is invalid or not provided.
 */
function initials(nameOrEmail?: string): string {
  if (!nameOrEmail) return "U";
  const base = nameOrEmail.trim();
  const at = base.indexOf("@");
  const name = at > 0 ? base.slice(0, at) : base;
  const parts = name.split(/\s+/);
  const first = parts[0]?.[0];
  const second = parts[1]?.[0];
  return (first ?? "U").toUpperCase() + (second?.toUpperCase() ?? "");
}

/**
 * Renders a user menu component for authenticated and guest users.
 * The menu includes options for signing in, signing up, accessing the user's profile, settings, and signing out.
 * It displays a tooltip-triggered dropdown based on the user's authentication status and provides
 * role-based actions within the menu.
 *
 * @return {JSX.Element | null} The UserMenu component that displays interactions based on the user's authentication state.
 * Returns null if the loading state is active.
 */
export default function UserMenu() {
  const { user, isLoading, signOut, accessToken } = useAuth();
  const navigate = useNavigate();
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorElement);

  if (isLoading) {
    return null;
  }

  /**
   * A function to handle the opening event triggered by a user interaction.
   * It sets the target element as the anchor point for further operations.
   *
   * @param {React.MouseEvent<HTMLElement>} event - The mouse event containing information about the user interaction.
   * @returns {void}
   */
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };
  const handleClose = () => setAnchorElement(null);

  const handleSignIn = async () => { handleClose(); await navigate("/auth/sign-in"); };
  const handleSignUp = async () => { handleClose(); await navigate("/auth/sign-up"); };
  const handleProfile = async () => { handleClose(); await navigate("/profile"); };
  const handleSettings = async () => { handleClose(); await navigate("/settings"); };
  const handleSignOut = async () => { handleClose(); await signOut(); await navigate("/auth/sign-in"); };

  const label = user?.name || user?.email || "User";

  const Trigger = accessToken
    ? <Avatar sx={{ width: 32, height: 32 }}>{initials(label)}</Avatar>
    : <AccountCircle fontSize="large" />;

  /**
   * An array representing menu items for an authenticated user interface.
   *
   * The `authedItems` array contains JSX elements representing a menu structure, which
   * includes header information, dividers, and actionable menu items such as profile,
   * settings, and logout options. Each element in the array has a specific role in
   * constructing the user dropdown menu.
   *
   * Structure:
   * - `MenuItem`: Used for clickable or static menu options. Includes handlers for
   *   user interactions (e.g., profile view, settings access, or sign-out action).
   * - `Divider`: Used to visually separate different sections of the menu.
   *
   * Properties in `MenuItem`:
   * - `key`: Unique identifier for each menu item or divider.
   * - `disabled`: Flag to indicate if the menu item is in a disabled state.
   * - `disableRipple`: Prevents ripple effect for the item when interacted with.
   * - `onClick`: Callback function triggered on clicking the menu item.
   * - `sx`: Custom styles applied to the menu item using the `sx` property.
   */
  const authedItems = [
    // Collect content as an array of valid elements for MenuList
    <MenuItem key="header" disabled disableRipple sx={{ py: 1.25, cursor: "default" }}>
      <div>
        <Typography variant="subtitle2">{label}</Typography>
        {user?.roles?.length ? (
          <Typography variant="caption" color="text.secondary">
            {user.roles.join(", ")}
          </Typography>
        ) : null}
      </div>
    </MenuItem>,
    <Divider key="div-1" />,
    <MenuItem key="profile" onClick={handleProfile}>
      <ListItemIcon><Person fontSize="small" /></ListItemIcon>
      My profile
    </MenuItem>,
    <MenuItem key="settings" onClick={handleSettings}>
      <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
      Settings
    </MenuItem>,
    <Divider key="div-2" />,
    <MenuItem key="logout" onClick={handleSignOut}>
      <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
      Sign out
    </MenuItem>,
  ];

  /**
   * guestItems is an array containing MenuItem components for unauthenticated user actions.
   * Each MenuItem includes an icon and text, and triggers a specific function upon being clicked.
   *
   * Properties of each MenuItem:
   * - key: Unique identifier for the MenuItem.
   * - onClick: Callback function to handle the corresponding action (e.g., sign in or sign up).
   * - ListItemIcon: Icon component displayed next to the text.
   * - Text Content: Descriptive text for the user action (e.g., "Sign in" or "Sign up").
   */
  const guestItems = [
    <MenuItem key="signin" onClick={handleSignIn}>
      <ListItemIcon><Login fontSize="small" /></ListItemIcon>
      Sign in
    </MenuItem>,
    <MenuItem key="signup" onClick={handleSignUp}>
      <ListItemIcon><PersonAdd fontSize="small" /></ListItemIcon>
      Sign up
    </MenuItem>,
  ];

  return (
    <div>
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
        anchorEl={anchorElement}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        // v6: use slotProps instead of PaperProps
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 220,
              "& .MuiMenuItem-root": { py: 1 },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {accessToken ? authedItems : guestItems}
      </Menu>
    </div>
  );
}
