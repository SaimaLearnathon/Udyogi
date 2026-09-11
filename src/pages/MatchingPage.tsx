import { MatchScoreCard } from "../components/matching/MatchScoreCard";
import { PageHeader } from "../components/ui/PageHeader";
import { useDemo } from "../context/DemoContext";
import { usePageTitle } from "../hooks/usePageTitle";

export function MatchingPage() {
  const { demoListings } = useDemo();
  usePageTitle("ম্যাচিং");

  return (
    <section>
      <PageHeader title="টিমমেট ম্যাচিং" subtitle="প্রকাশিত লিস্টিং, দরকারি ভূমিকা এবং ব্যাখ্যাসহ স্কোর।" />
      <div className="grid gap-4">
        {demoListings.map((listing) => (
          <MatchScoreCard key={listing.id} title={`${listing.title} - ${listing.role}`} score={listing.score} skills={listing.skills} />
        ))}
      </div>
    </section>
  );
}
