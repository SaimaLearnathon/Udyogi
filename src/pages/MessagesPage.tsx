import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { useDemo } from "../context/DemoContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer, staggerItem } from "../config/motion";

const avatarTones = ["bg-primary text-primary-content", "bg-secondary text-secondary-content", "bg-accent text-accent-content"];

export function MessagesPage() {
  const { demoMessages } = useDemo();
  usePageTitle("মেসেজ");

  return (
    <section>
      <PageHeader icon={Inbox} title="মেসেজ" subtitle="সংযোগ অনুরোধ গ্রহণের পর ব্যক্তিগত থ্রেডের জায়গা।" />
      <Card className="overflow-hidden p-1.5">
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="divide-y divide-base-200">
          {demoMessages.map((message, index) => (
            <motion.article
              key={message.id}
              variants={staggerItem}
              whileHover={{ backgroundColor: "var(--color-base-200)" }}
              className="flex cursor-pointer items-center gap-3 rounded-field p-3.5 transition-colors"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  avatarTones[index % avatarTones.length]
                }`}
              >
                {message.sender[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold">{message.sender}</p>
                  {message.unread && <span className="badge badge-primary badge-sm">নতুন</span>}
                </div>
                <p className="truncate text-sm text-base-content/60">{message.preview}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </Card>
    </section>
  );
}
