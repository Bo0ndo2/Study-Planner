import type { PlannerData, PlanResult, Subject } from "@/types/planner";

export function getUniqueSessionDates(plan: PlanResult) {
  return Array.from(new Set(plan.sessions.map((session) => session.date))).sort();
}

export function getSubjectCompletion(subject: Subject) {
  if (subject.totalHours === 0) {
    return 0;
  }

  return Math.min(100, (subject.completedHours / subject.totalHours) * 100);
}

export function hasMissedDates(data: PlannerData) {
  return data.blockedDates.length > 0;
}
