import { httpClient } from "@/lib/http-client";
import { PlannerData } from "@/types/planner";

function normalizePlannerData(data: PlannerData): PlannerData {
  return {
    ...data,
    subjects: data.subjects.map((subject) => ({
      ...subject,
      subtasks: subject.subtasks ?? [],
    })),
    completedSessions: data.completedSessions ?? [],
  };
}

export async function fetchPlannerData() {
  const response = await httpClient.get<PlannerData>("/planner");
  return normalizePlannerData(response.data);
}

export async function savePlannerData(data: PlannerData) {
  const response = await httpClient.put<PlannerData>("/planner", data);
  return normalizePlannerData(response.data);
}
