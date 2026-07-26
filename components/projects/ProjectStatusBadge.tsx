import { PauseCircle, HeartHandshake } from "lucide-react";

export type ProjectStatus = "active" | "paused" | "adoptable";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  if (status === "paused") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-500 dark:text-amber-300">
        <PauseCircle className="size-3.5" />
        En pause
      </span>
    );
  }

  if (status === "adoptable") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
        <HeartHandshake className="size-3.5" />
        À adopter
      </span>
    );
  }

  return null;
}
