import { useMemo } from "react";

export function useApp() {
  return useMemo(
    () => ({
      appName: "Campoignon",
      isReady: true,
    }),
    []
  );
}
