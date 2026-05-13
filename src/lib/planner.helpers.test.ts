import { describe, it, expect } from "vitest";
import { calculateSubjectScore, createDateRange, applySessionOverrides } from "./planner";
import type { Subject, StudySession } from "@/types/planner";

describe("planner helpers", () => {
  it("calculates subject score with urgency and priority influence", () => {
    const subject: Subject = {
      id: "s1",
      title: "Test",
      priority: 5,
      deadline: "2026-05-10",
      totalHours: 4,
      completedHours: 1,
      subtasks: [],
    };

    const score = calculateSubjectScore(subject, new Date("2026-05-08T00:00:00Z"));
    expect(typeof score).toBe("number");
    expect(score).toBeGreaterThan(0);
  });

  it("creates a date range skipping blocked dates", () => {
    const days = createDateRange("2026-05-01", "2026-05-05", ["2026-05-03"]);
    expect(days).toContain("2026-05-01");
    expect(days).not.toContain("2026-05-03");
  });

  it("applies session overrides only for valid dates", () => {
    const sessions: StudySession[] = [
      {
        id: "1",
        sessionKey: "s1-1",
        date: "2026-05-01",
        plannedDate: "2026-05-01",
        subjectId: "s1",
        subjectTitle: "Test",
        durationMinutes: 25,
        blockType: "focus",
        pomodoroIndex: 1,
        breakAfterMinutes: 5,
        priority: 3,
        deadline: "2026-05-10",
        status: "planned",
      },
    ];

    const overrides = [{ sessionKey: "s1-1", date: "2026-05-02" }];
    const result = applySessionOverrides(sessions, overrides, ["2026-05-02"]);
    expect(result[0].date).toBe("2026-05-02");
    expect(result[0].status).toBe("moved");
  });
});
