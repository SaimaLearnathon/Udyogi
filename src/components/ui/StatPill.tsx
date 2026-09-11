export function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
      <p className="text-sm text-base-content/60">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
