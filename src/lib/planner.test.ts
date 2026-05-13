import { describe, expect, it } from "vitest";

import { generateStudyPlan } from "./planner";
import { PlannerData } from "@/types/planner";

function createPlannerData(overrides: Partial<PlannerData> = {}): PlannerData {
  return {
    subjects: [
      {
        id: "math",
        title: "Mathematics",
        priority: 5,
        deadline: "2026-05-08",
        totalHours: 3,
        completedHours: 0,
        subtasks: [],
      },
      {
        id: "cs",
        title: "Computer Science",
        priority: 3,
        deadline: "2026-05-10",
        totalHours: 2,
        completedHours: 0,
      },
    ],
    dailyAvailabilityHours: 2,
    startDate: "2026-05-05",
    blockedDates: [],
    darkMode: true,
    sessionOverrides: [],
    ...overrides,
  };
}

describe("generateStudyPlan", () => {
  it("prioritizes the most urgent subject first", () => {
    const plan = generateStudyPlan(createPlannerData());

    expect(plan.sessions[0].subjectId).toBe("math");
    expect(plan.sessions[0].date >= "2026-05-04").toBe(true);
    expect(plan.sessions[0].durationMinutes).toBe(25);
    expect(plan.sessions[0].blockType).toBe("focus");
  });

  it("spreads a single subject across available days instead of front-loading it", () => {
    const plan = generateStudyPlan(
      createPlannerData({
        dailyAvailabilityHours: 4,
        subjects: [
          {
            id: "math",
            title: "Mathematics",
            priority: 4,
            deadline: "2026-05-08",
            totalHours: 6,
            completedHours: 0,
            subtasks: [],
          },
        ],
      }),
    );

    const scheduledDates = Array.from(new Set(plan.sessions.map((session) => session.date)));

    expect(scheduledDates.length).toBeGreaterThan(1);
    expect(plan.sessions.every((session) => session.durationMinutes <= 25)).toBe(true);
  });

  it("interleaves multiple subjects when both need work", () => {
    const plan = generateStudyPlan(createPlannerData({ dailyAvailabilityHours: 3 }));
    const firstDay = plan.sessions[0].date;
    const firstDaySubjects = plan.sessions
      .filter((session) => session.date === firstDay)
      .map((session) => session.subjectId);

    expect(new Set(firstDaySubjects).size).toBeGreaterThan(1);
  });

  it("marks missed days and shifts sessions forward", () => {
    const plan = generateStudyPlan(
      createPlannerData({
        blockedDates: ["2026-05-05"],
      }),
    );

    expect(plan.warnings).toContain("A missed day has been skipped and the plan was shifted forward.");
    expect(plan.sessions.some((session) => session.date === "2026-05-05")).toBe(false);
  });

  it("respects manual session overrides", () => {
    const plan = generateStudyPlan(
      createPlannerData({
        sessionOverrides: [{ sessionKey: "math-1", date: "2026-05-07" }],
      }),
    );

    const movedSession = plan.sessions.find((session) => session.sessionKey === "math-1");

    expect(movedSession).toBeDefined();
    expect(movedSession?.date).toBe("2026-05-07");
    expect(movedSession?.status).toBe("moved");
  });

  it("reports insufficient availability when work exceeds capacity", () => {
    const plan = generateStudyPlan(
      createPlannerData({
        dailyAvailabilityHours: 0.5,
        subjects: [
          {
            id: "math",
            title: "Mathematics",
            priority: 5,
            deadline: "2026-05-08",
            totalHours: 100,
            completedHours: 0,
            subtasks: [],
          },
        ],
      }),
    );

    expect(plan.warnings).toContain("Not enough availability to cover all remaining study hours.");
    expect(plan.summary.scheduledMinutes).toBeLessThan(plan.summary.remainingHours * 60);
  });
});
