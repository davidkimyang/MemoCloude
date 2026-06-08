type EmptyStateProps = {
  title: string;
  body?: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center text-muted">
      <p className="font-medium text-ink">{title}</p>
      {body ? <p className="mt-2 text-sm">{body}</p> : null}
    </div>
  );
}

