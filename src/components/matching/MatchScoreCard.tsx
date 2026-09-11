import { motion } from "framer-motion";
import { MapPin, MessageSquare } from "lucide-react";
import { Card } from "../ui/Card";

function scoreTone(score: number) {
  if (score >= 75) return { ring: "stroke-success", text: "text-success", label: "চমৎকার মিল" };
  if (score >= 50) return { ring: "stroke-warning", text: "text-warning", label: "মাঝারি মিল" };
  return { ring: "stroke-error", text: "text-error", label: "কম মিল" };
}

function ScoreRing({ score }: { score: number }) {
  const tone = scoreTone(score);
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={radius} strokeWidth="6" className="fill-none stroke-base-200" />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          strokeWidth="6"
          strokeLinecap="round"
          className={`fill-none ${tone.ring}`}
          style={{ strokeDasharray: circumference }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </svg>
      <span className={`absolute text-sm font-bold ${tone.text}`}>{score}</span>
    </div>
  );
}

export function MatchScoreCard({ title, score, skills }: { title: string; score: number; skills: string[] }) {
  const tone = scoreTone(score);

  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{title}</h2>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-base-content/50">
            <MapPin size={12} /> স্কিল, ক্ষেত্র, আগ্রহ ও লোকেশন থেকে স্কোর
          </p>
        </div>
        <ScoreRing score={score} />
      </div>

      <span className={`badge badge-sm mt-3 ${tone.text} badge-outline`}>{tone.label}</span>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span key={skill} className="badge badge-outline badge-sm">
            {skill}
          </span>
        ))}
      </div>

      <motion.button
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        className="btn btn-outline btn-sm mt-4 w-full gap-1.5"
      >
        <MessageSquare size={14} />
        সংযোগ অনুরোধ পাঠান
      </motion.button>
    </Card>
  );
}
