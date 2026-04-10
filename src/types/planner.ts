export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Subject = {
  id: string;
  title: string;
  priority: number;
  deadline: string;
  totalHours: number;
  completedHours: number;
  subtasks: Subtask[];
};

export type StudySession = {
  id: string;
  sessionKey: string;
  subjectId: string;
  subjectTitle: string;
  date: string;
  plannedDate: string;
  durationMinutes: number;
  blockType: "focus" | "review";
  pomodoroIndex: number;
  breakAfterMinutes: 5 | 15 | null;
  priority: number;
  deadline: string;
  status: "planned" | "moved" | "completed";
};

export type SessionOverride = {
  sessionKey: string;
  date: string;
};

export type PlannerData = {
  subjects: Subject[];
  dailyAvailabilityHours: number;
  startDate: string;
  blockedDates: string[];
  darkMode: boolean;
  sessionOverrides: SessionOverride[];
  completedSessions: string[];
};

export type PlannerSummary = {
  totalHours: number;
  remainingHours: number;
  completionRate: number;
  overdueSubjects: number;
  scheduledMinutes: number;
  totalAvailableMinutes: number;
};

export type PlanResult = {
  sessions: StudySession[];
  summary: PlannerSummary;
  warnings: string[];
};
