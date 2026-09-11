import { ThesisSectionList } from "../components/thesis/ThesisSectionList";
import { PageHeader } from "../components/ui/PageHeader";
import { useDemo } from "../context/DemoContext";
import { usePageTitle } from "../hooks/usePageTitle";

export function ThesisPage() {
  const { demoTheses } = useDemo();
  const thesis = demoTheses[0];
  usePageTitle("থিসিস");

  return (
    <section>
      <PageHeader title={thesis.title} subtitle="আটটি কাঠামোবদ্ধ সেকশনে পরিকল্পনা পর্যালোচনার টেমপ্লেট।" />
      <ThesisSectionList sections={thesis.sections} />
    </section>
  );
}
