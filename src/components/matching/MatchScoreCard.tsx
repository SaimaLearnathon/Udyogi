export function MatchScoreCard({ title, score, skills }: { title: string; score: number; skills: string[] }) {
  return (
    <article className="card border border-base-300 bg-base-100">
      <div className="card-body">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="card-title">{title}</h2>
            <p className="text-sm text-base-content/60">স্কিল মিল, ক্ষেত্র, আগ্রহ ও লোকেশন থেকে স্কোর</p>
          </div>
          <div className="radial-progress text-primary" style={{ "--value": score } as React.CSSProperties}>
            {score}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="badge badge-outline">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
