import { Send } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { usePageTitle } from "../hooks/usePageTitle";

export function ConsultantPage() {
  usePageTitle("কনসালট্যান্ট");

  return (
    <section>
      <PageHeader title="AI স্টার্টআপ কনসালট্যান্ট" subtitle="আইডিয়েশন বা ভ্যালিডেশন মোডে কথোপকথন শুরু করার জায়গা।" />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-base-300 bg-base-100 p-4">
          <p className="font-semibold">মোড</p>
          <div className="join mt-3 w-full">
            <button className="btn join-item btn-primary flex-1">আইডিয়া</button>
            <button className="btn join-item flex-1">ভ্যালিডেশন</button>
          </div>
        </div>
        <div className="rounded-lg border border-base-300 bg-base-100 p-4">
          <div className="min-h-72 rounded-lg bg-base-200 p-4 text-base-content/70">কথোপকথনের স্ট্রিম এখানে দেখা যাবে।</div>
          <div className="mt-3 flex gap-2">
            <input className="input input-bordered flex-1" placeholder="আপনার প্রেক্ষাপট বা আইডিয়া লিখুন" />
            <button className="btn btn-primary" type="button" aria-label="পাঠান">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
