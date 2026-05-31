// src/app/pages/Users.tsx
import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import http from "@/api/http";
import PageContainer from "@/components/PageContainer";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridColDef, QuickFilter, QuickFilterControl, Toolbar } from "@mui/x-data-grid";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";

// ---------- Types ----------
type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: "active" | "blocked" | "pending_verification" | "suspended";
  emailVerified: boolean;
  deleted: boolean;
  suspended: boolean;
};

const FALLBACK: User[] = [
  { id: "X", name: "John Doe", email: "john@example.com", roles: ["user"], status: "active", emailVerified: true, deleted: false, suspended: false },
];

type ToggleAction = {
  kind: "deleted" | "suspended";
  nextValue: boolean;
  user: User;
};

async function fetchUsers(): Promise<User[]> {
  const { data: payload } = await http.get<unknown>("/users");
  const items = Array.isArray(payload)
    ? payload
    : (typeof payload === "object" &&
      payload !== null &&
      "items" in payload &&
      Array.isArray(payload.items)
      ? payload.items
      : []);

  return items.map(normalizeUser);
}

async function setUserDeleted({ deleted, id }: { id: string; deleted: boolean }): Promise<User> {
  const { data } = await http.patch<unknown>(`/users/${encodeURIComponent(id)}/deleted`, { deleted });
  return normalizeUser(data);
}

async function setUserSuspended({ id, suspended }: { id: string; suspended: boolean }): Promise<User> {
  const { data } = await http.patch<unknown>(`/users/${encodeURIComponent(id)}/suspended`, { suspended });
  return normalizeUser(data);
}

function UsersToolbar(): JSX.Element {
  return (
    <Toolbar>
      <QuickFilter debounceMs={300}>
        <QuickFilterControl />
      </QuickFilter>
    </Toolbar>
  );
}

export default function Users(): JSX.Element {
  const { t: t11n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<ToggleAction | null>(null);
  const userRoles = useMemo(() => (user?.roles ?? []).map((role) => role.toLowerCase()), [user?.roles]);
  const isAdmin = userRoles.includes("admin");
  const isManager = userRoles.includes("manager");
  const canViewProfiles = isAdmin;

  const updateCachedUser = (updatedUser: User) => {
    queryClient.setQueryData<User[]>(["users"], (currentRows) => {
      if (!currentRows) return [updatedUser];
      return currentRows.map((row) => row.id === updatedUser.id ? updatedUser : row);
    });
  };

  const deleteMutation = useMutation({
    mutationFn: setUserDeleted,
    onSuccess: updateCachedUser,
  });

  const suspendMutation = useMutation({
    mutationFn: setUserSuspended,
    onSuccess: updateCachedUser,
  });

  const mutationError = deleteMutation.error ?? suspendMutation.error;
  const isMutating = deleteMutation.isPending || suspendMutation.isPending;

  const {
    data,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    // NOTE: placeholderData, а НЕ initialData → запрос идёт сразу
    placeholderData: FALLBACK,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
  });

  // Нормализуем rows на всякий случай
  const rows: User[] = useMemo(() => {
    return Array.isArray(data) ? data : FALLBACK;
  }, [data]);

  const columns = useMemo<GridColDef<User>[]>(
    () => [
      {
        field: "name",
        headerName: t11n("users.columns.name", { defaultValue: "Name" }),
        flex: 1.2,
        minWidth: 240,
        sortable: true,
        renderCell: (params) => (
          <Stack direction="row" spacing={1.5} sx={{ overflow: "hidden", alignItems: "center", opacity: params.row.deleted ? 0.62 : 1 }}>
            <Avatar sx={{ width: 28, height: 28 }}>
              {params.row?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap>{params.row?.name ?? ""}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {params.row?.email ?? ""}
              </Typography>
            </Stack>
          </Stack>
        ),
        // Защита от undefined
        valueGetter: (_value, row) => row.name ?? "",
      },
      {
        field: "roles",
        headerName: t11n("users.columns.roles", { defaultValue: "Roles" }),
        flex: 0.9,
        minWidth: 200,
        sortable: false,
        renderCell: (params) => (params.row?.roles ?? []).map((role: string) => {
          type Colors = 'secondary' | 'info' | 'success' | 'error';
          const color = {
            admin: 'secondary',
            manager: 'info',
            user: 'success'
          }[role] || 'error';
          return <Chip key={role} color={color as Colors} label={roleLabel(role, t11n)} size="small" />;
        }),
        valueGetter: (_value, row) => (row.roles ?? []).join(", "),
      },
      {
        field: "status",
        headerName: t11n("users.columns.status", { defaultValue: "Status" }),
        flex: 0.7,
        minWidth: 160,
        renderCell: (params) => {
          const status = params.row.suspended ? "suspended" : (params.row?.status ?? "active") as User["status"];
          const color: "success" | "error" | "warning" =
            status === "active" ? "success" : status === "blocked" || status === "suspended" ? "error" : "warning";
          return (
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
              <Chip size="small" color={color} label={userStatusLabel(status, t11n)} />
              {params.row.deleted && <Chip size="small" variant="outlined" color="default" label={t11n("users.statuses.deleted")} />}
            </Stack>
          );
        },
      },
      {
        field: "emailVerified",
        headerName: t11n("users.columns.verified", { defaultValue: "Verified" }),
        flex: 0.6,
        minWidth: 140,
        renderCell: (params) => {
          const [color, label]: ["success" | "error", string] = params.row?.emailVerified
            ? ["success", t11n("actions.yes")]
            : ["error", t11n("actions.no")];
          return <Chip size="small" color={color} label={label} />;
        }
      },
      {
        field: "actions",
        headerName: t11n("users.columns.actions", { defaultValue: "Actions" }),
        sortable: false,
        filterable: false,
        align: "right",
        headerAlign: "right",
        flex: 0.8,
        minWidth: 200,
        renderCell: (params) => {
          const row = params.row;
          const userId = row?.id;
          const canDelete = isAdmin || row.id === user?.id;
          const canSuspend = (isAdmin || isManager) && !row.deleted;
          const handleView = async () => {
            if (userId && canViewProfiles) {
              await navigate(`/users/${encodeURIComponent(userId)}/profile`);
            }
          };
          const handleSuspend = () => {
            if (canSuspend) {
              setPendingAction({ kind: "suspended", nextValue: !row.suspended, user: row });
            }
          };
          const handleDelete = () => {
            if (canDelete) {
              setPendingAction({ kind: "deleted", nextValue: !row.deleted, user: row });
            }
          };

          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={canViewProfiles ? t11n("users.actions.view", { defaultValue: "View" }) : t11n("users.tooltips.adminOnlyProfiles")}>
                <span>
                  <IconButton size="small" onClick={handleView} disabled={!canViewProfiles}>
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={suspendTooltip(row, canSuspend, t11n)}>
                <span>
                  <IconButton size="small" onClick={handleSuspend} disabled={!canSuspend || isMutating}>
                    {row.suspended ? <LockOpenOutlinedIcon fontSize="small" /> : <BlockOutlinedIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={deleteTooltip(row, canDelete, t11n)}>
                <span>
                  <IconButton size="small" color={row.deleted ? "default" : "error"} onClick={handleDelete} disabled={!canDelete || isMutating}>
                    {row.deleted ? <RestoreFromTrashOutlinedIcon fontSize="small" /> : <DeleteOutlineOutlinedIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [canViewProfiles, isAdmin, isManager, isMutating, navigate, t11n, user?.id]
  );

  const handleCancelAction = () => setPendingAction(null);

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.kind === "deleted") {
      await deleteMutation.mutateAsync({ id: pendingAction.user.id, deleted: pendingAction.nextValue });
    } else {
      await suspendMutation.mutateAsync({ id: pendingAction.user.id, suspended: pendingAction.nextValue });
    }

    setPendingAction(null);
  };

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        {t11n("users.title")}
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message ?? t11n("users.errors.load")}
        </Alert>
      )}

      {mutationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(mutationError as Error)?.message ?? t11n("users.errors.update")}
        </Alert>
      )}

      <Paper sx={{ width: "100%", height: 600 }}>
        <Box sx={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id || row.email}
            getRowClassName={(params) => params.row.deleted ? "deleted-user-row" : ""}
            disableRowSelectionOnClick
            loading={isFetching || isMutating}
            pageSizeOptions={[10, 25, 50]}
            sx={{
              "& .deleted-user-row": {
                opacity: 0.62,
              },
            }}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
              // сортировку можно оставить, теперь valueGetter защищён
              sorting: { sortModel: [{ field: "name", sort: "asc" }] },
            }}
            slots={{ toolbar: UsersToolbar }}
          />
        </Box>
      </Paper>

      <Dialog open={Boolean(pendingAction)} onClose={handleCancelAction}>
        <DialogTitle>{pendingAction ? confirmationTitle(pendingAction, t11n) : ""}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingAction ? confirmationMessage(pendingAction, t11n) : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction} disabled={isMutating}>
            {t11n("actions.cancel")}
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={pendingAction?.kind === "deleted" && pendingAction.nextValue ? "error" : "primary"}
            variant="contained"
            disabled={isMutating}
          >
            {pendingAction ? confirmationConfirmLabel(pendingAction, t11n) : t11n("actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

function roleLabel(role: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  return t(`users.roles.${role}`, { defaultValue: role });
}

function userStatusLabel(status: User["status"], t: (key: string, options?: Record<string, unknown>) => string): string {
  return t(`users.statuses.${status}`);
}

function normalizeUser(value: unknown): User {
  const objectValue = isRecord(value) ? value : {};
  const status = stringField(objectValue, "status");
  const deleted = booleanField(objectValue, "deleted") ?? booleanField(objectValue, "is_deleted") ?? status === "deleted";
  const suspended = booleanField(objectValue, "suspended") ?? booleanField(objectValue, "is_suspended") ?? status === "suspended";

  return {
    id: stringField(objectValue, "id") ?? stringField(objectValue, "email") ?? "",
    name: stringField(objectValue, "name") ?? stringField(objectValue, "display_name") ?? "",
    email: stringField(objectValue, "email") ?? "",
    roles: rolesField(objectValue),
    status: userStatusField(status, suspended),
    emailVerified: booleanField(objectValue, "emailVerified") ?? booleanField(objectValue, "email_verified") ?? true,
    deleted,
    suspended,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringField(value: Record<string, unknown>, field: string): string | undefined {
  return typeof value[field] === "string" ? value[field] : undefined;
}

function booleanField(value: Record<string, unknown>, field: string): boolean | undefined {
  return typeof value[field] === "boolean" ? value[field] : undefined;
}

function rolesField(value: Record<string, unknown>): string[] {
  if (Array.isArray(value.roles)) {
    return value.roles.filter((role: unknown): role is string => typeof role === "string");
  }

  return typeof value.role === "string" ? [value.role] : [];
}

function userStatusField(status: string | undefined, suspended: boolean): User["status"] {
  if (suspended) return "suspended";
  if (status === "active" || status === "blocked" || status === "pending_verification" || status === "suspended") {
    return status;
  }

  return "active";
}

function suspendTooltip(user: User, allowed: boolean, t: (key: string, options?: Record<string, unknown>) => string): string {
  if (user.deleted) return t("users.tooltips.deletedCannotBeSuspended");
  if (!allowed) return t("users.tooltips.suspendNotAllowed");
  return user.suspended ? t("users.actions.unsuspend") : t("users.actions.suspend");
}

function deleteTooltip(user: User, allowed: boolean, t: (key: string, options?: Record<string, unknown>) => string): string {
  if (!allowed) return t("users.tooltips.deleteNotAllowed");
  return user.deleted ? t("users.actions.restore") : t("users.actions.delete");
}

function confirmationTitle(action: ToggleAction, t: (key: string, options?: Record<string, unknown>) => string): string {
  if (action.kind === "deleted") {
    return action.nextValue ? t("users.confirm.deleteTitle") : t("users.confirm.restoreTitle");
  }

  return action.nextValue ? t("users.confirm.suspendTitle") : t("users.confirm.unsuspendTitle");
}

function confirmationMessage(action: ToggleAction, t: (key: string, options?: Record<string, unknown>) => string): string {
  const name = action.user.name || action.user.email || action.user.id;
  if (action.kind === "deleted") {
    return action.nextValue
      ? t("users.confirm.deleteMessage", { name })
      : t("users.confirm.restoreMessage", { name });
  }

  return action.nextValue
    ? t("users.confirm.suspendMessage", { name })
    : t("users.confirm.unsuspendMessage", { name });
}

function confirmationConfirmLabel(action: ToggleAction, t: (key: string, options?: Record<string, unknown>) => string): string {
  if (action.kind === "deleted") {
    return action.nextValue ? t("users.actions.delete") : t("users.actions.restore");
  }

  return action.nextValue ? t("users.actions.suspend") : t("users.actions.unsuspend");
}
