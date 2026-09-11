import { ArrowRight } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { StatPill } from "../components/ui/StatPill";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";

export function OnboardingPage() {
  const { goTo } = useNavigation();
  usePageTitle("শুরু");

  return (
    <section>
      <PageHeader
        title="ধারণাকে পরিকল্পনা, পরিকল্পনাকে দলে রূপ দিন"
        subtitle="AI কনসালট্যান্ট, থিসিস ওয়ার্কস্পেস এবং স্বচ্ছ ম্যাচিং স্কোর দিয়ে বাংলাদেশি প্রতিষ্ঠাতাদের জন্য একটি কাজের জায়গা।"
      />
      <div className="grid gap-3 md:grid-cols-3">
        <StatPill label="মূল ফ্লো" value="৩" />
        <StatPill label="থিসিস সেকশন" value="৮" />
        <StatPill label="ম্যাচিং স্কোর" value="০-১০০" />
      </div>
      <button type="button" className="btn btn-primary mt-6" onClick={() => goTo("consultant")}>
        শুরু করুন
        <ArrowRight size={18} />
      </button>
    </section>
  );
}
