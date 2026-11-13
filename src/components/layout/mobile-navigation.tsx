"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { useQuickExpense } from "@/components/layout/quick-expense";
import { mobileNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const pathname = usePathname();
  const { openExpense } = useQuickExpense();
  const leading = mobileNavigation.slice(0, 2);
  const trailing = mobileNavigation.slice(2);

  return (
    <nav
      aria-label="Atalhos"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="grid grid-cols-5 items-end px-1 pt-1">
        {leading.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.shortLabel} icon={item.icon} pathname={pathname} />
        ))}
        <div className="flex justify-center">
          <button
            type="button"
            className="-mt-5 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_24px_-12px_rgba(20,80,70,0.75)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
            aria-label="Registrar despesa"
            onClick={openExpense}
          >
            <Plus className="size-6" aria-hidden />
          </button>
        </div>
        {trailing.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.shortLabel} icon={item.icon} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: (typeof mobileNavigation)[number]["icon"];
  pathname: string;
}) {
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] leading-tight font-medium text-muted-foreground",
        active && "text-accent-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden />
      <span className="max-w-full text-center">{label}</span>
    </Link>
  );
}
