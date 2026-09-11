import { motion } from "framer-motion";
import { Handshake, Search, SlidersHorizontal } from "lucide-react";
import { MatchScoreCard } from "../components/matching/MatchScoreCard";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { useDemo } from "../context/DemoContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer } from "../config/motion";

export function MatchingPage() {
  const { demoListings } = useDemo();
  usePageTitle("ম্যাচিং");

  return (
    <section>
      <PageHeader icon={Handshake} title="টিমমেট ম্যাচিং" subtitle="প্রকাশিত লিস্টিং, দরকারি ভূমিকা এবং ব্যাখ্যাসহ স্কোর।" />

      <Card className="mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <label className="input input-bordered input-sm flex flex-1 items-center gap-2">
          <Search size={14} className="text-base-content/40" />
          <input className="grow" placeholder="স্কিল, ক্ষেত্র বা টাইটেল দিয়ে খুঁজুন" />
        </label>
        <select className="select select-bordered select-sm">
          <option>স্কোর অনুযায়ী সাজান</option>
          <option>সাম্প্রতিকতা অনুযায়ী</option>
          <option>দূরত্ব অনুযায়ী</option>
        </select>
        <button type="button" className="btn btn-ghost btn-sm gap-1.5">
          <SlidersHorizontal size={14} />
          ফিল্টার
        </button>
      </Card>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2">
        {demoListings.map((listing) => (
          <MatchScoreCard key={listing.id} title={`${listing.title} - ${listing.role}`} score={listing.score} skills={listing.skills} />
        ))}
      </motion.div>
    </section>
  );
}
