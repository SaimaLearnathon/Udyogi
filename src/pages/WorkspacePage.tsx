import { motion } from "framer-motion";
import { FileText, Layers, Plus } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { useDemo } from "../context/DemoContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer } from "../config/motion";

const statusBadge: Record<string, string> = {
  খসড়া: "badge-warning",
  নিশ্চিত: "badge-success",
  প্রকাশিত: "badge-info"
};

export function WorkspacePage() {
  const { demoTheses } = useDemo();
  const { goTo } = useNavigation();
  usePageTitle("ওয়ার্কস্পেস");

  return (
    <section>
      <PageHeader icon={Layers} title="থিসিস ওয়ার্কস্পেস" subtitle="খসড়া, নিশ্চিত ভার্সন এবং প্রকাশযোগ্য পরিকল্পনা এক জায়গায়।" />
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2">
        {demoTheses.map((thesis) => {
          const total = 8;
          const filled = thesis.sections.length;
          return (
            <Card key={thesis.id} hover className="cursor-pointer p-5" onClick={() => goTo("thesis")}>
              <div className="flex items-start justify-between gap-3">
                <span className={`badge ${statusBadge[thesis.status] ?? "badge-neutral"} badge-sm`}>{thesis.status}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-field bg-primary/10 text-primary">
                  <FileText size={16} />
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold">{thesis.title}</h2>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-base-content/55">
                  <span>{filled}/{total} সেকশন প্রস্তুত</span>
                  <span>{Math.round((filled / total) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-200">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(filled / total) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {thesis.sections.map((section) => (
                  <span key={section} className="badge badge-outline badge-sm">
                    {section}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}

        <motion.button
          type="button"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => goTo("consultant")}
          className="flex min-h-45 flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed border-base-300 text-base-content/50 transition-colors hover:border-primary hover:text-primary"
        >
          <Plus size={22} />
          <span className="text-sm font-medium">নতুন থিসিস শুরু করুন</span>
        </motion.button>
      </motion.div>
    </section>
  );
}
