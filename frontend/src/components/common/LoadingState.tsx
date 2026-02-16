export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-base-100 px-4">
      <div className="space-y-3 text-center">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/80">{label}</p>
      </div>
    </div>
  );
}
