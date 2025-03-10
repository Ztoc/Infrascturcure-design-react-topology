import { cn } from "@/lib/utils";

type StatusType = "online" | "offline" | "warning";

interface StatusIndicatorProps {
  status: StatusType;
  pulse?: boolean;
  text?: boolean;
}

const statusText = {
  online: "Online",
  offline: "Offline",
  warning: "Warning",
};

const statusColors = {
  online: {
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  offline: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  warning: {
    dot: "bg-yellow-500",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
};

export default function StatusIndicator({
  status,
  pulse = true,
  text = true,
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn("h-2.5 w-2.5 rounded-full", statusColors[status].dot, {
          "animate-pulse-subtle": pulse,
        })}
      />
      {text && (
        <span className={cn("text-sm font-medium px-1.5 py-0.5 rounded-full", statusColors[status].badge)}>
          {statusText[status]}
        </span>
      )}
    </div>
  );
}
