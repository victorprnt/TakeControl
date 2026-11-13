import { cn } from "@/lib/utils";

type StreamMarkProps = {
  className?: string;
  compact?: boolean;
};

export function StreamMark({ className, compact = false }: StreamMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path
            d="M4 15.5c2.2-3.6 4.2-3.6 6.5 0s4.3 3.6 6.5 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 10c2.2-3.6 4.2-3.6 6.5 0s4.3 3.6 6.5 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.65"
          />
        </svg>
      </span>
      <span className={cn("text-[13px] font-semibold tracking-[0.2em] text-foreground", compact && "sr-only")}>
        STREAM
      </span>
    </span>
  );
}
