export function ThesisSectionList({ sections }: { sections: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {sections.map((section) => (
        <div key={section} className="rounded-lg border border-base-300 bg-base-100 p-4">
          <p className="font-semibold">{section}</p>
          <p className="text-sm text-base-content/60">এই অংশে কনসালট্যান্ট থেকে তৈরি তথ্য বসবে।</p>
        </div>
      ))}
    </div>
  );
}
