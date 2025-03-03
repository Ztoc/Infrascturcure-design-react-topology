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

export default function StatusIndicator({
  status,
  pulse = true,
  text = true,
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn("h-2.5 w-2.5 rounded-full", {
          "bg-green-500": status === "online",
          "bg-red-500": status === "offline",
          "bg-yellow-500": status === "warning",
          "animate-pulse-subtle": pulse,
        })}
      />
      {text && (
        <span className="text-sm font-medium text-muted-foreground">
          {statusText[status]}
        </span>
      )}
    </div>
  );
}
