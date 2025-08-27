import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/PageContainer";


type User = { id: string; name: string; email: string };

const FALLBACK: User[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com" },
  { id: "2", name: "Alan Turing", email: "alan@example.com" },
];

// if you need to "simulate" asynch — making "delay" utility strongly typed
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

// Demo-request (change for actual fetch)
async function fetchUsers(): Promise<User[]> {
  // ideal case:
  // const res = await fetch("/api/users");
  // if (!res.ok) throw new Error("Failed to load users");
  // return (await res.json()) as User[];

  // Demo with delay
  return delay<User[]>(2000, FALLBACK);
}

export default function Users() {
  const { t: t11n } = useTranslation();

  const { data = FALLBACK } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 10_000,
    initialData: FALLBACK,
  });

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>{t11n("users.title")}</Typography>
      <List>
        {data.map((u) => (
          <ListItem key={u.id} divider>
            <ListItemAvatar><Avatar>{u.name.at(0)}</Avatar></ListItemAvatar>
            <ListItemText primary={u.name} secondary={u.email} />
          </ListItem>
        ))}
      </List>
    </PageContainer>
  );
}
