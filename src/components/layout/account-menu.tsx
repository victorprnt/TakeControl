"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";

import { mainNavigation } from "@/constants/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const accountLinks = mainNavigation.filter((item) =>
  ["/categories", "/recurring", "/settings"].includes(item.href),
);

export function AccountMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 pr-3 pl-1 ring-1 ring-white/15"
        aria-label="Abrir identificação da conta"
        onClick={() => setOpen(true)}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <UserRound className="size-4" aria-hidden />
        </span>
        <span className="hidden text-sm font-medium text-foreground sm:inline">Minha conta</span>
      </button>
      <SheetContent side="right" className="w-[min(100%,20rem)]">
        <SheetHeader>
          <SheetTitle>Minha conta</SheetTitle>
          <SheetDescription>Atalhos que não cabem na barra inferior.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Conta" className="grid gap-1 px-2">
          {accountLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-foreground hover:bg-accent"
              >
                <Icon className="size-4 text-muted-foreground" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
