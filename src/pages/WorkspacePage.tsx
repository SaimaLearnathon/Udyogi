import { PageHeader } from "../components/ui/PageHeader";
import { useDemo } from "../context/DemoContext";
import { usePageTitle } from "../hooks/usePageTitle";

export function WorkspacePage() {
  const { demoTheses } = useDemo();
  usePageTitle("ওয়ার্কস্পেস");

  return (
    <section>
      <PageHeader title="থিসিস ওয়ার্কস্পেস" subtitle="খসড়া, নিশ্চিত ভার্সন এবং প্রকাশযোগ্য পরিকল্পনা এক জায়গায়।" />
      <div className="grid gap-4">
        {demoTheses.map((thesis) => (
          <article key={thesis.id} className="card border border-base-300 bg-base-100">
            <div className="card-body">
              <span className="badge badge-warning w-fit">{thesis.status}</span>
              <h2 className="card-title">{thesis.title}</h2>
              <p className="text-sm text-base-content/60">{thesis.sections.length}টি সেকশন প্রস্তুত</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
