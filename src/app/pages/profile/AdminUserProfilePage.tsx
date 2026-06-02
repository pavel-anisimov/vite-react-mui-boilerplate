import type { JSX } from "react";

import { FullUserProfilePage } from "@/app/pages/profile/Profile";

export default function AdminUserProfilePage(): JSX.Element {
  return <FullUserProfilePage mode="admin" />;
}
