import type { PlannerData, SessionOverride, Subject } from "@/types/planner";

export type SubjectField = keyof Subject;
export type LastSessionMove = {
  sessionKey: string;
  previousDate: string;
  nextDate: string;
};

export function mergePlannerData(current: PlannerData, partialData: Partial<PlannerData>): PlannerData {
  return { ...current, ...partialData };
}

export function addPlannerSubject(current: PlannerData, subject: Subject): PlannerData {
  const title = subject.title.trim();

  if (!title) {
    return current;
  }

  return {
    ...current,
    subjects: [...current.subjects, { ...subject, title, subtasks: subject.subtasks ?? [] }],
  };
}

export function updatePlannerSubject(
  current: PlannerData,
  id: string,
  field: SubjectField,
  value: string | number,
): PlannerData {
  return {
    ...current,
    subjects: current.subjects.map((subject) =>
      subject.id === id ? { ...subject, [field]: value } : subject,
    ),
  };
}

export function removePlannerSubject(current: PlannerData, id: string): PlannerData {
  return {
    ...current,
    subjects: current.subjects.filter((subject) => subject.id !== id),
    sessionOverrides: current.sessionOverrides.filter((entry) => !entry.sessionKey.startsWith(`${id}-`)),
  };
}

export function addPlannerSubtask(current: PlannerData, subjectId: string, title: string): PlannerData {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return current;
  }

  return {
    ...current,
    subjects: current.subjects.map((subject) =>
      subject.id === subjectId
        ? {
            ...subject,
            subtasks: [
              ...(subject.subtasks ?? []),
              { id: crypto.randomUUID(), title: trimmedTitle, done: false },
            ],
          }
        : subject,
    ),
  };
}

export function togglePlannerSubtask(current: PlannerData, subjectId: string, subtaskId: string): PlannerData {
  return {
    ...current,
    subjects: current.subjects.map((subject) =>
      subject.id === subjectId
        ? {
            ...subject,
            subtasks: (subject.subtasks ?? []).map((subtask) =>
              subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask,
            ),
          }
        : subject,
    ),
  };
}

export function removePlannerSubtask(current: PlannerData, subjectId: string, subtaskId: string): PlannerData {
  return {
    ...current,
    subjects: current.subjects.map((subject) =>
      subject.id === subjectId
        ? {
            ...subject,
            subtasks: (subject.subtasks ?? []).filter((subtask) => subtask.id !== subtaskId),
          }
        : subject,
    ),
  };
}

export function addCompletedMinutesToSubject(current: PlannerData, subjectId: string, minutes: number): PlannerData {
  return {
    ...current,
    subjects: current.subjects.map((subject) => {
      if (subject.id !== subjectId) return subject;

      const addedHours = minutes / 60;
      const nextCompleted = Math.min(subject.totalHours, (subject.completedHours ?? 0) + addedHours);

      return {
        ...subject,
        completedHours: Number(nextCompleted.toFixed(2)),
      };
    }),
  };
}

export function removeCompletedMinutesFromSubject(current: PlannerData, subjectId: string, minutes: number): PlannerData {
  return {
    ...current,
    subjects: current.subjects.map((subject) => {
      if (subject.id !== subjectId) return subject;

      const removedHours = minutes / 60;
      const nextCompleted = Math.max(0, (subject.completedHours ?? 0) - removedHours);

      return {
        ...subject,
        completedHours: Number(nextCompleted.toFixed(2)),
      };
    }),
  };
}

export function togglePlannerSessionCompleted(current: PlannerData, sessionKey: string): PlannerData {
  const set = new Set(current.completedSessions ?? []);

  if (set.has(sessionKey)) {
    set.delete(sessionKey);
  } else {
    set.add(sessionKey);
  }

  return {
    ...current,
    completedSessions: Array.from(set),
  };
}

export function upsertSessionOverride(
  overrides: SessionOverride[],
  sessionKey: string,
  nextDate: string,
  plannedDate: string,
): SessionOverride[] {
  const withoutCurrent = overrides.filter((entry) => entry.sessionKey !== sessionKey);

  if (nextDate === plannedDate) {
    return withoutCurrent;
  }

  return [...withoutCurrent, { sessionKey, date: nextDate }];
}

export function setPlannerSessionOverride(
  current: PlannerData,
  sessionKey: string,
  nextDate: string,
  plannedDate: string,
): PlannerData {
  return {
    ...current,
    sessionOverrides: upsertSessionOverride(current.sessionOverrides, sessionKey, nextDate, plannedDate),
  };
}

export function clearPlannerSessionOverrides(current: PlannerData): PlannerData {
  return { ...current, sessionOverrides: [] };
}

export function togglePlannerTheme(current: PlannerData): PlannerData {
  return { ...current, darkMode: !current.darkMode };
}

export function markPlannerDateMissed(current: PlannerData, dateKey: string): PlannerData {
  return {
    ...current,
    blockedDates: Array.from(new Set([...current.blockedDates, dateKey])),
    startDate: dateKey,
  };
}

export function clearPlannerMissedDates(current: PlannerData): PlannerData {
  return { ...current, blockedDates: [] };
}
