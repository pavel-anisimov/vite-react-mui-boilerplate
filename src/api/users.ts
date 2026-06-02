import http from "@/api/http";

import type { PaginatedResponse, User } from "@/api/types";

export type GetUsersParams = {
  page: number;
  limit: number;
  q?: string;
};

export async function getUsers({ limit, page, q }: GetUsersParams): Promise<PaginatedResponse<User>> {
  const { data } = await http.get<PaginatedResponse<User>>("/users", {
    params: {
      page,
      limit,
      q,
    },
  });

  return data;
}

export async function setUserDeleted({ deleted, id }: { id: string; deleted: boolean }): Promise<User> {
  const { data } = await http.patch<User>(`/users/${encodeURIComponent(id)}/deleted`, { deleted });
  return data;
}

export async function setUserSuspended({ id, suspended }: { id: string; suspended: boolean }): Promise<User> {
  const { data } = await http.patch<User>(`/users/${encodeURIComponent(id)}/suspended`, { suspended });
  return data;
}
