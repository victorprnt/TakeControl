"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="group sticky top-0 z-20 hidden h-dvh w-[4.75rem] transition-[width] duration-200 ease-out hover:w-56 focus-within:w-56 md:block">
      <div className="flex h-full flex-col px-2 py-6">
        <nav aria-label="Principal" className="flex flex-1 flex-col gap-2">
          {mainNavigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 w-11 items-center gap-3 overflow-hidden rounded-full px-3.5 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 group-hover:w-full group-focus-within:w-full",
                  active && "bg-white/15 text-white shadow-[0_0_22px_rgba(143,214,242,0.5)] ring-1 ring-white/40",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="max-w-0 truncate opacity-0 transition-all duration-200 group-hover:max-w-40 group-hover:opacity-100 group-focus-within:max-w-40 group-focus-within:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
