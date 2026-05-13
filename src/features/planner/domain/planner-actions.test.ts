import { describe, expect, it } from "vitest";

import {
  addPlannerSubject,
  addPlannerSubtask,
  markPlannerDateMissed,
  removePlannerSubject,
  removePlannerSubtask,
  setPlannerSessionOverride,
  togglePlannerTheme,
  togglePlannerSubtask,
  updatePlannerSubject,
} from "./planner-actions";
import type { PlannerData } from "@/types/planner";

function createPlannerData(): PlannerData {
  return {
    subjects: [
      {
        id: "math",
        title: "Mathematics",
        priority: 5,
        deadline: "2026-05-15",
        totalHours: 4,
        completedHours: 1,
        subtasks: [],
      },
    ],
    dailyAvailabilityHours: 2,
    startDate: "2026-05-09",
    blockedDates: [],
    darkMode: false,
    sessionOverrides: [{ sessionKey: "math-1", date: "2026-05-10" }],
  };
}

describe("planner actions", () => {
  it("normalizes subject titles before adding them", () => {
    const nextData = addPlannerSubject(createPlannerData(), {
      id: "cs",
      title: "  Computer Science  ",
      priority: 4,
      deadline: "2026-05-18",
      totalHours: 6,
      completedHours: 0,
      subtasks: [],
    });

    expect(nextData.subjects.at(-1)?.title).toBe("Computer Science");
  });

  it("updates a single subject field without touching other fields", () => {
    const nextData = updatePlannerSubject(createPlannerData(), "math", "completedHours", 2);

    expect(nextData.subjects[0]).toMatchObject({
      id: "math",
      title: "Mathematics",
      completedHours: 2,
    });
  });

  it("removes a subject and its session overrides together", () => {
    const nextData = removePlannerSubject(createPlannerData(), "math");

    expect(nextData.subjects).toHaveLength(0);
    expect(nextData.sessionOverrides).toHaveLength(0);
  });

  it("upserts session overrides and clears them when moved back to the planned date", () => {
    const moved = setPlannerSessionOverride(createPlannerData(), "math-2", "2026-05-12", "2026-05-11");
    const restored = setPlannerSessionOverride(moved, "math-2", "2026-05-11", "2026-05-11");

    expect(moved.sessionOverrides).toContainEqual({ sessionKey: "math-2", date: "2026-05-12" });
    expect(restored.sessionOverrides).not.toContainEqual({ sessionKey: "math-2", date: "2026-05-12" });
  });

  it("keeps cross-cutting preferences and missed days explicit", () => {
    const themed = togglePlannerTheme(createPlannerData());
    const missed = markPlannerDateMissed(themed, "2026-05-09");

    expect(themed.darkMode).toBe(true);
    expect(missed.blockedDates).toEqual(["2026-05-09"]);
    expect(missed.startDate).toBe("2026-05-09");
  });

  it("adds, toggles, and removes subtasks", () => {
    const added = addPlannerSubtask(createPlannerData(), "math", "Read chapter 1");
    const subtaskId = added.subjects[0].subtasks[0].id;
    const toggled = togglePlannerSubtask(added, "math", subtaskId);
    const removed = removePlannerSubtask(toggled, "math", subtaskId);

    expect(added.subjects[0].subtasks).toHaveLength(1);
    expect(toggled.subjects[0].subtasks[0].done).toBe(true);
    expect(removed.subjects[0].subtasks).toHaveLength(0);
  });
});
