import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { surfaceClassName } from "@/components/shared/surface";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(surfaceClassName, "flex flex-col items-start gap-3 px-5 py-8", className)}>
      <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
