import { describe, it, expect } from "vitest";
import { parseDateKey, formatDateKey, addDays, daysBetween } from "./planner-utils";

describe("planner-utils date helpers", () => {
  it("parses and formats date keys consistently", () => {
    const d = parseDateKey("2026-05-09");
    expect(formatDateKey(d)).toBe("2026-05-09");
    expect(formatDateKey("2026-05-09T12:00:00")).toBe("2026-05-09");
  });

  it("adds days using UTC and computes days between", () => {
    const start = parseDateKey("2026-05-01");
    const next = addDays(start, 7);
    expect(formatDateKey(next)).toBe("2026-05-08");
    expect(daysBetween(start, next)).toBe(7);
  });
});
