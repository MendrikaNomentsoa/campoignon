import { useMemo } from "react";

export function useAuth() {
  return useMemo(
    () => ({
      user: null,
      isAuthenticated: false,
      login: () => undefined,
      logout: () => undefined,
    }),
    []
  );
}
