// src/app/routes/ProfileSetupGuard.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

/**
 * Global guard that funnels authenticated users with an incomplete profile
 * to the profile setup page.
 *
 * Rules:
 * - Only acts when auth state is loaded and a user is present.
 * - Only acts when the backend explicitly reports `profileCompleted: false`.
 *   A missing field (older backends / mock mode) is treated as completed,
 *   so existing flows are not broken.
 * - Never redirects while already on /profile/setup (no loops).
 * - Never redirects from public auth pages (/auth/*).
 *
 * The original location is passed as router state so the setup page can
 * return the user to the route they intended to visit.
 *
 * @return {null} Renders nothing.
 */
export default function ProfileSetupGuard(): null {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.profileCompleted !== false) return;

    const { pathname } = location;
    if (pathname === "/profile/setup" || pathname.startsWith("/auth/")) return;

    navigate("/profile/setup", { replace: true, state: { from: location } });
  }, [isLoading, user, location, navigate]);

  return null;
}
