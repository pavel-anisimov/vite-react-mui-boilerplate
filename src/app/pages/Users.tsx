import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import type {JSX} from "react";

import PageContainer from "@/components/PageContainer";


type User = { id: string; name: string; email: string };

const FALLBACK: User[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com" },
  { id: "2", name: "Alan Turing", email: "alan@example.com" },
];

/**
 * Delays the execution of a resolved promise by the specified number of milliseconds.
 *
 * @param {number} ms - The number of milliseconds to wait before resolving the promise.
 * @param {T} value - The value to be returned after the delay.
 * @return {Promise<T>} A promise that resolves with the provided value after the specified delay.
 */
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

/**
 * Fetches a list of users asynchronously.
 *
 * This method retrieves user data, potentially involving a delay or fallback mechanism.
 *
 * @return {Promise<User[]>} A promise that resolves to a list of users.
 */
async function fetchUsers(): Promise<User[]> {
  // ideal case:
  // const res = await fetch("/api/users");
  // if (!res.ok) throw new Error("Failed to load users");
  // return (await res.json()) as User[];

  // Demo with delay
  return delay<User[]>(2000, FALLBACK);
}

/**
 * A React component that fetches and displays a list of users.
 *
 * This component utilizes the `useQuery` hook to retrieve user data and displays it
 * in a formatted list. It supports localization using the `useTranslation` hook.
 * The component includes user details such as name and email in a visually styled format.
 *
 * @constructor
 *
 * @return {JSX.Element} A JSX element rendering the page container with a title and a list of users.
 */
export default function Users(): JSX.Element {
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
