// src/app/pages/Users.tsx
import type { JSX } from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import PageContainer from "@/components/PageContainer";

import {
  Alert,
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

// ---------- Типы ----------
type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: "active" | "blocked" | "pending_verification";
  emailVerified: boolean;
};

type ApiUsersResponse =
  | User[]
  | { items: User[]; total: number; page: number; limit: number };

const FALLBACK: User[] = [
  { id: "X", name: "John Doe", email: "john@example.com", roles: ["user"], status: "active", emailVerified: true },
];

// ---------- Реальная загрузка ----------
function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem("auth"); // тот же ключ, что и в твоём http.ts
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed.accessToken ?? null;
  } catch {
    return null;
  }
}


function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

async function fetchUsers(): Promise<User[]> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3100";
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  // Для отладки: видно, вызывается ли функция
  // console.log("[Users] fetchUsers called");

  const res = await fetch(`${base}/api/users`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const payload = await res.json() as any;
  const items: any[] = Array.isArray(payload) ? payload : payload?.items ?? [];

  return items.map((u) => ({
    id: u.id ?? u.email,
    name: u.name ?? "",
    email: u.email ?? "",
    roles: Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : []),
    status: u.status ?? "active",
    emailVerified: u.emailVerified ?? true,
  })) as User[];
}

export default function Users(): JSX.Element {
  const { t: t11n } = useTranslation();

  const {
    data,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    // ВАЖНО: placeholderData, а НЕ initialData → запрос идёт сразу
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
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ overflow: "hidden" }}>
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
        valueGetter: (p) => p.row?.name ?? "",
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
          return <Chip key={role} color={color as Colors} label={role} size="small" />;
        }),
        valueGetter: (p) => (p.row?.roles ?? []).join(", "),
      },
      {
        field: "status",
        headerName: t11n("users.columns.status", { defaultValue: "Status" }),
        flex: 0.7,
        minWidth: 160,
        renderCell: (params) => {
          const status = (params.row?.status ?? "active") as User["status"];
          const label = status === "pending_verification" ? "pending" : status;
          const color =
            status === "active" ? "success" : status === "blocked" ? "error" : "warning";
          return <Chip size="small" color={color as any} label={label} />;
        },
      },
      {
        field: "emailVerified",
        headerName: t11n("users.columns.verified", { defaultValue: "Verified" }),
        flex: 0.6,
        minWidth: 140,
        renderCell: (params) => {
          const [ color, label ] = params.row?.emailVerified ? [ 'success', 'Yes'] : [ 'error', 'No']
          return <Chip size="small" color={color as any} label={label} />;
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
          const userId = params.row?.id;
          const handleView = () => console.log("view user", userId);
          const handleBan = () => console.log("ban user", userId);
          const handleDelete = () => console.log("delete user", userId);

          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={t11n("users.actions.view", { defaultValue: "View" })}>
                <IconButton size="small" onClick={handleView}>
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t11n("users.actions.ban", { defaultValue: "Ban" })}>
                <IconButton size="small" onClick={handleBan}>
                  <BlockOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t11n("users.actions.delete", { defaultValue: "Delete" })}>
                <IconButton size="small" color="error" onClick={handleDelete}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [t11n]
  );

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        {t11n("users.title")}
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message ?? "Failed to load users"}
        </Alert>
      )}

      <Paper sx={{ width: "100%", height: 600 }}>
        <Box sx={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id || row.email}
            disableRowSelectionOnClick
            loading={isFetching}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
              // сортировку можно оставить, теперь valueGetter защищён
              sorting: { sortModel: [{ field: "name", sort: "asc" }] },
            }}
            slots={{ toolbar: GridToolbarQuickFilter }}
            slotProps={{ toolbar: { quickFilterProps: { debounceMs: 300 } } }}
          />
        </Box>
      </Paper>
    </PageContainer>
  );
}
