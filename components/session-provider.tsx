"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  clearUser,
  parseUser,
  readUserRaw,
  writeUser,
  type User,
} from "@/lib/session";

type SessionValue = {
  user: User | null;
  login: (user: User | null) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionValue>({
  user: null,
  login: () => {},
  signOut: () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

// El servidor no ve localStorage: su instantánea es siempre "sin sesión".
const serverSnapshot = () => null;

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const raw = useSyncExternalStore(subscribe, readUserRaw, serverSnapshot);
  const user = useMemo(() => parseUser(raw), [raw]);

  const value = useMemo<SessionValue>(
    () => ({
      user,
      login: (next: User | null) => {
        if (next) writeUser(next);
        else clearUser();
        emit();
      },
      signOut: () => {
        clearUser();
        emit();
      },
    }),
    [user],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
