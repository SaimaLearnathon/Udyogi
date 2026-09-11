import { Briefcase } from "lucide-react";
import { Card } from "../ui/Card";
import type { PublicCurrentProject } from "../../types/profile";

export function CurrentProjectsCard({ projects, emptyMessage }: { projects: PublicCurrentProject[]; emptyMessage?: string }) {
  if (projects.length === 0 && !emptyMessage) return null;

  return (
    <Card className="p-5">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-base-content/70">
        <Briefcase size={14} className="text-primary" /> বর্তমানে যে কাজ করছেন
      </p>
      {projects.length === 0 ? (
        <p className="text-sm text-base-content/50">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <div key={project.thesisId} className="rounded-field border border-base-300 p-3">
              <p className="text-sm font-medium">{project.title}</p>
              {project.pitch && <p className="mt-0.5 text-xs text-base-content/60">{project.pitch}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-base-content/50">
                <span>প্রতিষ্ঠাতা: {project.founderName}</span>
                {project.skillTag && <span className="badge badge-outline badge-sm">{project.skillTag}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
