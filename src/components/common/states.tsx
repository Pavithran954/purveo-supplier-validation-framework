export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="font-medium text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function LoadingState() {
  return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading…</div>;
}

export function ErrorState({ message = "Something went wrong." }: { message?: string }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>;
}
