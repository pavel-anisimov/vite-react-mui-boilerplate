// src/app/pages/Users.tsx
import type { ChangeEvent, JSX } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { getUsers, setUserDeleted, setUserSuspended } from "@/api/users";
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
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import type { PaginatedResponse, User as ApiUser, UserStatus } from "@/api/types";

// ---------- Types ----------
type UserRowStatus = Extract<UserStatus, "active" | "pending" | "pending_verification" | "suspended" | "deactivated" | "deleted">;

type UserRow = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: UserRowStatus;
  emailVerified: boolean;
  deleted: boolean;
  suspended: boolean;
};

type ToggleAction = {
  kind: "deleted" | "suspended";
  nextValue: boolean;
  user: UserRow;
};

async function fetchUsers(page: number, limit: number, q: string): Promise<PaginatedResponse<UserRow>> {
  const data = await getUsers({ page, limit, q });

  return {
    ...data,
    items: data.items.map(normalizeUser),
  };
}

export default function Users(): JSX.Element {
  const { t: t11n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<ToggleAction | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [searchQuery, setSearchQuery] = useState("");
  const userRoles = useMemo(() => (user?.roles ?? []).map((role) => role.toLowerCase()), [user?.roles]);
  const isAdmin = userRoles.includes("admin");
  const isManager = userRoles.includes("manager");
  const canViewProfiles = isAdmin || isManager;
  const page = paginationModel.page + 1;
  const limit = paginationModel.pageSize;
  const q = searchQuery.trim();
  const invalidateUsers = () => {
    void queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const deleteMutation = useMutation({
    mutationFn: setUserDeleted,
    onSuccess: invalidateUsers,
  });

  const suspendMutation = useMutation({
    mutationFn: setUserSuspended,
    onSuccess: invalidateUsers,
  });

  const mutationError = deleteMutation.error ?? suspendMutation.error;
  const isMutating = deleteMutation.isPending || suspendMutation.isPending;

  const {
    data,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["users", page, limit, q],
    queryFn: () => fetchUsers(page, limit, q),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const columns = useMemo<GridColDef<UserRow>[]>(
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
          type Colors = "secondary" | "info" | "success" | "error";
          const color = {
            admin: "secondary",
            manager: "info",
            user: "success",
          }[role] || "error";
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
          const status = params.row.status;
          const color = statusColor(status);
          return (
            <Stack
              direction="row"
              spacing={0.75}
              useFlexGap
              sx={{ height: "100%", flexWrap: "wrap", alignItems: "center", alignContent: "center" }}
            >
              <Chip size="small" color={color} label={userStatusLabel(status, t11n)} />
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
              await navigate(`/admin/users/${encodeURIComponent(userId)}/profile`);
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 2, alignItems: { sm: "center" }, justifyContent: "space-between" }}
      >
        <Typography variant="h4">
          {t11n("users.title")}
        </Typography>
        <TextField
          size="small"
          label={t11n("actions.search")}
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: { xs: "100%", sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

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
            pageSizeOptions={[20, 50, 100]}
            paginationMode="server"
            paginationModel={paginationModel}
            rowCount={total}
            onPaginationModelChange={setPaginationModel}
            sx={{
              "& .deleted-user-row": {
                opacity: 0.62,
              },
            }}
            initialState={{
              sorting: { sortModel: [{ field: "name", sort: "asc" }] },
            }}
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

function userStatusLabel(status: UserRowStatus, t: (key: string, options?: Record<string, unknown>) => string): string {
  return t(`users.statuses.${status}`);
}

function normalizeUser(value: ApiUser): UserRow {
  const fullName = [value.first_name, value.last_name].filter(isNonEmptyString).join(" ");
  const displayName = value.name ?? value.display_name ?? fullName;
  const name = isNonEmptyString(displayName) ? displayName : value.username ?? value.email;
  const deleted = value.deleted ?? value.is_deleted ?? value.status === "deleted";
  const apiStatus = value.status as UserStatus | "blocked" | undefined;
  const suspended = value.suspended ?? value.is_suspended ?? (apiStatus === "suspended" || apiStatus === "blocked");

  return {
    id: value.id || value.email,
    name,
    email: value.email,
    roles: value.roles ?? [],
    status: userStatusField(apiStatus, suspended, deleted),
    emailVerified: value.emailVerified ?? value.email_verified ?? false,
    deleted,
    suspended,
  };
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function userStatusField(status: UserStatus | "blocked" | undefined, suspended: boolean, deleted: boolean): UserRowStatus {
  if (deleted) return "deleted";
  if (suspended) return "suspended";
  if (
    status === "active" ||
    status === "pending" ||
    status === "pending_verification" ||
    status === "suspended" ||
    status === "deactivated" ||
    status === "deleted"
  ) {
    return status;
  }

  return "active";
}

function statusColor(status: UserRowStatus): "default" | "success" | "error" | "warning" {
  if (status === "active") return "success";
  if (status === "pending" || status === "pending_verification") return "warning";
  if (status === "deleted" || status === "deactivated") return "default";
  return "error";
}

function suspendTooltip(user: UserRow, allowed: boolean, t: (key: string, options?: Record<string, unknown>) => string): string {
  if (user.deleted) return t("users.tooltips.deletedCannotBeSuspended");
  if (!allowed) return t("users.tooltips.suspendNotAllowed");
  return user.suspended ? t("users.actions.unsuspend") : t("users.actions.suspend");
}

function deleteTooltip(user: UserRow, allowed: boolean, t: (key: string, options?: Record<string, unknown>) => string): string {
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
