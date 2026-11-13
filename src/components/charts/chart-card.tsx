import type { ReactNode } from "react";

import { surfaceClassName } from "@/components/shared/surface";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <section className={cn(surfaceClassName, "min-w-0 p-4 sm:p-5", className)}>
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="min-w-0 overflow-hidden">{children}</div>
    </section>
  );
}
