import { CloudOff } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

type DataErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function DataErrorState({ message, onRetry }: DataErrorStateProps) {
  return (
    <EmptyState
      icon={CloudOff}
      title="Os dados não carregaram"
      description={message}
      action={
        <Button type="button" className="h-11 rounded-full px-4" onClick={onRetry}>
          Tentar de novo
        </Button>
      }
    />
  );
}
