"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { StreamMark } from "@/components/layout/stream-mark";
import { mainNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 hidden h-dvh flex-col border-r border-border/80 bg-card px-3 py-5 md:flex">
      <div className="px-1">
        <StreamMark compact className="lg:hidden" />
        <StreamMark className="hidden lg:inline-flex" />
      </div>
      <nav aria-label="Principal" className="mt-8 flex flex-1 flex-col gap-1">
        {mainNavigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={cn(
                "flex min-h-11 items-center justify-center gap-3 rounded-2xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:justify-start lg:px-3",
                active && "bg-accent text-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="hidden truncate lg:inline">{item.label}</span>
              <span className="sr-only lg:hidden">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <p className="hidden px-3 pt-4 text-xs leading-5 text-muted-foreground lg:block">
        Orçamento por envelopes
      </p>
    </aside>
  );
}
