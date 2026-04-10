import { PlannerData } from "@/types/planner";

const STORAGE_KEY = "study-planner-pro:v1";

const defaultData: PlannerData = {
  subjects: [
    {
      id: "math",
      title: "Mathematics",
      priority: 5,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
      totalHours: 12,
      completedHours: 3,
      subtasks: [],
    },
    {
      id: "cs",
      title: "Computer Science",
      priority: 4,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10),
      totalHours: 10,
      completedHours: 2,
      subtasks: [],
    },
  ],
  dailyAvailabilityHours: 4,
  startDate: new Date().toISOString().slice(0, 10),
  blockedDates: [],
  darkMode: true,
  sessionOverrides: [],
  completedSessions: [],
};

export function getDefaultPlannerData() {
  return {
    ...defaultData,
    subjects: defaultData.subjects.map((subject) => ({ ...subject })),
    blockedDates: [...defaultData.blockedDates],
    sessionOverrides: [...defaultData.sessionOverrides],
  };
}

type StoredSubtask = {
  id?: unknown;
  title?: unknown;
  done?: unknown;
};

function isStoredSubtask(subtask: unknown): subtask is StoredSubtask {
  return Boolean(subtask) && typeof subtask === "object";
}

function normalizeSubject(subject: unknown) {
  if (!subject || typeof subject !== "object") {
    return null;
  }

  const value = subject as PlannerData["subjects"][number] & { subtasks?: unknown };

  return {
    ...value,
    subtasks: Array.isArray(value.subtasks)
      ? value.subtasks
          .filter(isStoredSubtask)
          .map((subtask) => ({
            id: typeof subtask.id === "string" ? subtask.id : crypto.randomUUID(),
            title: typeof subtask.title === "string" ? subtask.title : "Untitled subtask",
            done: Boolean(subtask.done),
          }))
      : [],
  };
}

export function loadPlannerData() {
  if (typeof window === "undefined") {
    return defaultData;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return defaultData;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<PlannerData>;
    return {
      ...getDefaultPlannerData(),
      ...parsed,
      subjects: Array.isArray(parsed.subjects)
        ? parsed.subjects.map(normalizeSubject).filter((subject): subject is NonNullable<typeof subject> => Boolean(subject))
        : getDefaultPlannerData().subjects,
      blockedDates: Array.isArray(parsed.blockedDates) ? parsed.blockedDates : [],
      sessionOverrides: Array.isArray(parsed.sessionOverrides) ? parsed.sessionOverrides : [],
      completedSessions: Array.isArray(parsed.completedSessions) ? parsed.completedSessions : [],
    };
  } catch {
    return getDefaultPlannerData();
  }
}

export function savePlannerData(data: PlannerData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
