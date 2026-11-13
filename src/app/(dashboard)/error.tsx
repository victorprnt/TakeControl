"use client";

import { useEffect } from "react";

import { DataErrorState } from "@/components/shared/data-error-state";

export default function DashboardError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <DataErrorState
      message="Não foi possível abrir esta tela. Tente de novo em instantes."
      onRetry={retry}
    />
  );
}
