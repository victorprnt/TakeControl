type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Carregando" }: LoadingStateProps) {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-4">
      <p className="sr-only">{label}</p>
      <div className="h-36 animate-pulse rounded-[1.4rem] bg-card" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-[1.4rem] bg-card" />
        <div className="h-28 animate-pulse rounded-[1.4rem] bg-card" />
      </div>
      <div className="h-64 animate-pulse rounded-[1.4rem] bg-card" />
    </div>
  );
}
