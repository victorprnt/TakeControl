"use client";

import { useState } from "react";
import { Moon } from "lucide-react";

import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { surfaceClassName } from "@/components/shared/surface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const [open, setOpen] = useState(false);
  const [closedPreview, setClosedPreview] = useState(false);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={cn(surfaceClassName, "p-5")}>
        <h2 className="text-sm font-semibold text-foreground">Conta</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Minha conta usa este aparelho apenas como prévia. Não há sessão real nesta etapa.
        </p>
      </section>
      <section className={cn(surfaceClassName, "p-5")}>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
            <Moon className="size-4" aria-hidden />
          </span>
          <h2 className="text-sm font-semibold text-foreground">Aparência</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O tema claro está ativo. O modo escuro já possui tokens e será alternável depois.
        </p>
      </section>
      <section className={cn(surfaceClassName, "p-5 lg:col-span-2")}>
        <h2 className="text-sm font-semibold text-foreground">Sessão</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          {closedPreview
            ? "A prévia de encerramento foi confirmada. Nenhum dado foi apagado."
            : "Use o diálogo para ver a confirmação antes de uma ação sensível."}
        </p>
        <Button
          variant="outline"
          className="mt-4 h-11 rounded-full px-4"
          onClick={() => setOpen(true)}
        >
          Encerrar prévia
        </Button>
      </section>
      <ConfirmationDialog
        open={open}
        title="Encerrar a prévia da sessão?"
        description="Isso só demonstra o diálogo. A tela continua disponível."
        confirmLabel="Encerrar"
        tone="danger"
        onOpenChange={setOpen}
        onConfirm={() => {
          setClosedPreview(true);
          setOpen(false);
        }}
      />
    </div>
  );
}
