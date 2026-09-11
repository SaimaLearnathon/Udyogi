import { CheckCircle2, FileText } from "lucide-react";
import { motion } from "framer-motion";
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
      <PageHeader
        icon={FileText}
        title={thesis.title}
        subtitle="আটটি কাঠামোবদ্ধ সেকশনে পরিকল্পনা পর্যালোচনার টেমপ্লেট।"
        action={
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} type="button" className="btn btn-primary btn-sm gap-1.5">
            <CheckCircle2 size={15} />
            থিসিস নিশ্চিত করুন
          </motion.button>
        }
      />
      <ThesisSectionList sections={thesis.sections} />
    </section>
  );
}
