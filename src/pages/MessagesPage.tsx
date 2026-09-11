import { PageHeader } from "../components/ui/PageHeader";
import { useDemo } from "../context/DemoContext";
import { usePageTitle } from "../hooks/usePageTitle";

export function MessagesPage() {
  const { demoMessages } = useDemo();
  usePageTitle("মেসেজ");

  return (
    <section>
      <PageHeader title="মেসেজ" subtitle="সংযোগ অনুরোধ গ্রহণের পর ব্যক্তিগত থ্রেডের জায়গা।" />
      <div className="grid gap-3">
        {demoMessages.map((message) => (
          <article key={message.id} className="rounded-lg border border-base-300 bg-base-100 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold">{message.sender}</p>
              {message.unread && <span className="badge badge-primary">নতুন</span>}
            </div>
            <p className="text-base-content/70">{message.preview}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
