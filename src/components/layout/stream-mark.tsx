import { APP_NAME, APP_TAGLINE } from "@/constants/app";
import { cn } from "@/lib/utils";

type StreamMarkProps = {
  className?: string;
  compact?: boolean;
};

export function StreamMark({ className, compact = false }: StreamMarkProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <svg viewBox="0 0 24 24" className="size-8 shrink-0 text-white drop-shadow-[0_0_12px_rgba(143,214,242,0.75)]" aria-hidden>
        <path
          d="M3.5 15.5c2.4-4 4.6-4 7 0s4.6 4 7 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M3.5 10c2.4-4 4.6-4 7 0s4.6 4 7 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold tracking-tight text-white">{APP_NAME}</span>
        <span className={cn("mt-0.5 block truncate text-xs text-white/60", compact && "sr-only")}>{APP_TAGLINE}</span>
      </span>
    </span>
  );
}
