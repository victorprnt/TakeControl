import { cn } from "@/lib/utils";
import type { ProgressTone } from "@/types/finance-snapshot";

const toneClassName: Record<ProgressTone, string> = {
  safe: "bg-primary",
  warning: "bg-warning",
  danger: "bg-destructive",
};

type ProgressBarProps = {
  value: number;
  tone?: ProgressTone;
  label?: string;
};

export function ProgressBar({ value, tone = "safe", label }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={width}
      aria-valuetext={`${value}%`}
      aria-label={label}
    >
      <div
        className={cn("h-full rounded-full transition-[width]", toneClassName[tone])}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
