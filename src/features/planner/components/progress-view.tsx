"use client";

import { getSubjectCompletion } from "@/features/planner/domain/planner-selectors";
import type { Subject } from "@/types/planner";

interface ProgressViewProps {
  subjects: Subject[];
}

export function ProgressView({ subjects }: ProgressViewProps) {
  if (subjects.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-panel p-5">
      <h2 className="text-lg font-semibold">Quick progress view</h2>
      <div className="mt-5 space-y-4">
        {subjects.map((subject) => {
          const completion = getSubjectCompletion(subject);

          return (
            <div key={subject.id} className="rounded-lg border border-border bg-background p-4 transition hover:border-accent/30">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{subject.title || "Untitled subject"}</span>
                <span className="text-muted">{Math.round(completion)}%</span>
              </div>
              <div className="mt-3 h-2 rounded-sm bg-panelAlt">
                <div className="h-2 rounded-sm bg-success transition-all duration-300" style={{ width: `${completion}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted">
                <span>{subject.completedHours.toFixed(1)}h done</span>
                <span>{subject.totalHours.toFixed(1)}h total</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
