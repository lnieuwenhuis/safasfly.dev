export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-base-100 px-4">
      <div className="max-w-xl space-y-4 text-center">
        <div className="alert alert-error/80">
          <span>{message}</span>
        </div>
        {onRetry ? (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
