export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-6">
      <p className="text-sm font-semibold text-primary">Uddogi</p>
      <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-base-content/70">{subtitle}</p>
    </header>
  );
}
