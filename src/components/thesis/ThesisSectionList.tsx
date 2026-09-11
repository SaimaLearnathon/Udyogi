import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Briefcase, DollarSign, Lightbulb, Rocket, Scale, Target, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";
import { Markdown } from "../ui/Markdown";
import type { ThesisParsedData } from "../../types/thesis";

const feasibilityTone: Record<string, string> = { High: "badge-success", Medium: "badge-warning", Low: "badge-error" };
const priorityTone: Record<string, string> = { High: "badge-error", Medium: "badge-warning", Low: "badge-ghost" };

const sectionDefs: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "idea", label: "আইডিয়া সারসংক্ষেপ", icon: Lightbulb },
  { id: "feasibility", label: "সম্ভাব্যতা", icon: Target },
  { id: "market", label: "বাজার বিশ্লেষণ", icon: TrendingUp },
  { id: "licensing", label: "আইনি বিবেচনা", icon: Scale },
  { id: "mvp", label: "MVP রোডম্যাপ", icon: Rocket },
  { id: "financial", label: "আর্থিক মূল্যায়ন", icon: DollarSign },
  { id: "resources", label: "প্রয়োজনীয় সম্পদ", icon: Briefcase },
  { id: "skills", label: "প্রয়োজনীয় দক্ষতা", icon: Users }
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-base-content/45">{label}</p>
      <p className="text-sm leading-relaxed text-base-content/80">{value}</p>
    </div>
  );
}

function Disclaimer({ text }: { text: string }) {
  return (
    <div className="alert alert-info gap-2 py-2 text-xs">
      <AlertCircle size={14} className="shrink-0" />
      {text}
    </div>
  );
}

export function ThesisSectionList({ data }: { data: ThesisParsedData }) {
  const [active, setActive] = useState(sectionDefs[0].id);

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <Card className="flex gap-1.5 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
        {sectionDefs.map((section) => {
          const Icon = section.icon;
          const selected = active === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActive(section.id)}
              className={`relative flex shrink-0 items-center gap-2.5 rounded-field px-3 py-2.5 text-left text-sm font-medium transition-colors lg:shrink ${
                selected ? "text-primary-content" : "text-base-content/70 hover:bg-base-200"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="thesis-section-active"
                  className="absolute inset-0 rounded-field bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={15} className="relative z-10 shrink-0" />
              <span className="relative z-10 whitespace-nowrap">{section.label}</span>
            </button>
          );
        })}
      </Card>

      <Card className="min-h-64 p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {active === "idea" && (
              <div className="space-y-4">
                <Field label="সমস্যা" value={data.idea_summary.problem} />
                <Field label="সমাধান" value={data.idea_summary.solution} />
                <Field label="লক্ষ্য গ্রাহক" value={data.idea_summary.target_customer} />
                <Field label="মূল্য প্রস্তাবনা" value={data.idea_summary.value_proposition} />
              </div>
            )}

            {active === "feasibility" && (
              <div className="space-y-3">
                <span className={`badge ${feasibilityTone[data.feasibility_assessment.rating] ?? "badge-ghost"}`}>
                  {data.feasibility_assessment.rating}
                </span>
                <div className="text-sm leading-relaxed text-base-content/80">
                  <Markdown>{data.feasibility_assessment.rationale}</Markdown>
                </div>
              </div>
            )}

            {active === "market" && (
              <div className="space-y-4">
                <Field label="বাজারের বর্ণনা" value={data.market_analysis.market_description} />
                <Field label="লক্ষ্য সেগমেন্ট" value={data.market_analysis.target_segment} />
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/45">প্রতিযোগী</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.market_analysis.competitors.map((competitor) => (
                      <span key={competitor} className="badge badge-outline badge-sm">
                        {competitor}
                      </span>
                    ))}
                  </div>
                </div>
                <Field label="পার্থক্য" value={data.market_analysis.differentiation} />
              </div>
            )}

            {active === "licensing" && (
              <div className="space-y-3">
                <Disclaimer text="শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আইনি পরামর্শ নয়।" />
                <div className="text-sm leading-relaxed text-base-content/80">
                  <Markdown>{data.licensing_notes}</Markdown>
                </div>
              </div>
            )}

            {active === "mvp" && (
              <ol className="space-y-4 border-l-2 border-base-300 pl-5">
                {data.mvp_roadmap.map((phase, index) => (
                  <li key={index} className="relative">
                    <span className="absolute -left-[1.65rem] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-content">
                      {index + 1}
                    </span>
                    <p className="font-semibold">{phase.phase}</p>
                    <p className="text-sm text-base-content/65">{phase.description}</p>
                    <p className="mt-1 text-xs text-base-content/45">{phase.estimated_timeframe}</p>
                  </li>
                ))}
              </ol>
            )}

            {active === "financial" && (
              <div className="space-y-4">
                <Disclaimer text="শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আর্থিক পরামর্শ নয়।" />
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/45">খরচের খাত</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.financial_evaluation.estimated_cost_categories.map((category) => (
                      <span key={category} className="badge badge-outline badge-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <Field label="রাজস্ব মডেল" value={data.financial_evaluation.revenue_model} />
                <Field label="রানওয়ে সংক্রান্ত নোট" value={data.financial_evaluation.runway_notes} />
              </div>
            )}

            {active === "resources" && (
              <div className="flex flex-wrap gap-2">
                {data.required_resources.map((resource) => (
                  <span key={resource} className="badge badge-outline">
                    {resource}
                  </span>
                ))}
              </div>
            )}

            {active === "skills" && (
              <div className="space-y-3">
                {data.required_skillsets.map((skill) => (
                  <div key={skill.skill_tag} className="flex items-start justify-between gap-3 rounded-field border border-base-300 p-3">
                    <div>
                      <p className="font-semibold">{skill.skill_tag}</p>
                      <p className="text-sm text-base-content/60">{skill.description}</p>
                    </div>
                    <span className={`badge badge-sm shrink-0 ${priorityTone[skill.priority] ?? "badge-ghost"}`}>{skill.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}
