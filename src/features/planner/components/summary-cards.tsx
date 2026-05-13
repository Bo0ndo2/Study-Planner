"use client";

import type { PlanResult } from "@/types/planner";

interface SummaryCardsProps {
  plan: PlanResult;
  subjectCount: number;
  planningDaysCount: number;
}

function formatHours(minutes: number) {
  return `${(minutes / 60).toFixed(1)}h`;
}

export function SummaryCards({ plan, subjectCount, planningDaysCount }: SummaryCardsProps) {
  const summaryCards = [
    {
      label: "Remaining hours",
      value: formatHours(plan.summary.remainingHours * 60),
      detail: `${subjectCount} subjects active`,
      tone: "bg-accent",
    },
    {
      label: "Completion",
      value: `${Math.round(plan.summary.completionRate)}%`,
      detail: "Progress tracked per subject",
      tone: "bg-success",
    },
    {
      label: "Scheduled time",
      value: formatHours(plan.summary.scheduledMinutes),
      detail: `${planningDaysCount} planning days`,
      tone: "bg-foreground",
    },
    {
      label: "Risk alerts",
      value: String(plan.summary.overdueSubjects),
      detail: plan.warnings.length > 0 ? plan.warnings[0] : "No current blockers",
      tone: "bg-danger",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <article key={card.label} className="rounded-lg border border-border bg-panel p-5 transition hover:-translate-y-0.5 hover:border-accent/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            </div>
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${card.tone}`} aria-hidden="true" />
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-muted">{card.detail}</p>
        </article>
      ))}
    </div>
  );
}
