import { PlanResult, PlannerData, StudySession, Subject } from "@/types/planner";

import { parseDateKey, formatDateKey, addDays, daysBetween } from "@/lib/planner-utils";

const POMODORO_MINUTES = 25;
const LONG_BREAK_INTERVAL = 4;
const DAY_BUFFER = 7;

type SchedulableSubject = Subject & {
  remainingMinutes: number;
  initialRemainingMinutes: number;
};

export function calculateSubjectScore(
  subject: Subject,
  currentDate: Date,
  options: {
    previousSubjectId?: string | null;
    scheduledTodayMinutes?: number;
    dailyTargetMinutes?: number;
  } = {},
) {
  const deadlineDate = parseDateKey(subject.deadline);
  const daysLeft = daysBetween(currentDate, deadlineDate);
  const remainingHours = Math.max(0, subject.totalHours - subject.completedHours);
  const deadlinePressure = daysLeft === 0 ? 40 : 28 / Math.max(1, daysLeft);
  const priorityWeight = subject.priority * 18;
  const remainingWorkWeight = remainingHours * 2;
  const sameSubjectPenalty = options.previousSubjectId === subject.id ? 18 : 0;
  const spacingBoost =
    options.scheduledTodayMinutes === 0 || options.scheduledTodayMinutes === undefined ? 6 : 0;
  const targetPressure =
    options.dailyTargetMinutes && options.scheduledTodayMinutes !== undefined
      ? Math.max(0, options.dailyTargetMinutes - options.scheduledTodayMinutes) / POMODORO_MINUTES
      : 0;

  return priorityWeight + deadlinePressure + remainingWorkWeight + spacingBoost + targetPressure - sameSubjectPenalty;
}

export function createDateRange(startDate: string, endDate: string, blockedDates: string[]) {
  const days: string[] = [];
  const blocked = new Set(blockedDates.map(formatDateKey));
  let currentDate = parseDateKey(startDate);
  const finalDate = parseDateKey(endDate);

  while (currentDate <= finalDate) {
    const dateKey = formatDateKey(currentDate);
    if (!blocked.has(dateKey)) {
      days.push(dateKey);
    }
    currentDate = addDays(currentDate, 1);
  }

  return days;
}

function countAvailableDatesThroughDeadline(dateRange: string[], currentDate: string, deadline: string) {
  const remainingDates = dateRange.filter((dateKey) => dateKey >= currentDate && dateKey <= deadline);
  return Math.max(1, remainingDates.length);
}

function roundUpToPomodoro(minutes: number) {
  return Math.ceil(minutes / POMODORO_MINUTES) * POMODORO_MINUTES;
}

function getDailyTargetMinutes(subject: SchedulableSubject, dateRange: string[], dateKey: string) {
  const availableDays = countAvailableDatesThroughDeadline(dateRange, dateKey, subject.deadline);
  return Math.max(POMODORO_MINUTES, roundUpToPomodoro(subject.remainingMinutes / availableDays));
}

function getBreakAfterMinutes(pomodoroIndex: number): StudySession["breakAfterMinutes"] {
  return pomodoroIndex % LONG_BREAK_INTERVAL === 0 ? 15 : 5;
}

export function applySessionOverrides(
  sessions: StudySession[],
  overrides: PlannerData["sessionOverrides"],
  validDates: string[],
) {
  if (overrides.length === 0) {
    return sessions;
  }

  const validDateSet = new Set(validDates);
  const overrideMap = new Map(overrides.map((entry) => [entry.sessionKey, entry.date]));

  return sessions.map((session) => {
    const nextDate = overrideMap.get(session.sessionKey);

    if (!nextDate || !validDateSet.has(nextDate)) {
      return session;
    }

    const status: StudySession["status"] = nextDate === session.plannedDate ? "planned" : "moved";

    return {
      ...session,
      date: nextDate,
      status,
    };
  });
}

export function generateStudyPlan(data: PlannerData): PlanResult {
  const startDate = parseDateKey(data.startDate);
  const activeSubjects = data.subjects
    .filter((subject) => subject.totalHours > subject.completedHours)
    .map((subject) => ({
      ...subject,
      remainingMinutes: Math.max(0, Math.round((subject.totalHours - subject.completedHours) * 60)),
      initialRemainingMinutes: Math.max(0, Math.round((subject.totalHours - subject.completedHours) * 60)),
    }));

  const latestDeadline = activeSubjects.reduce((latest, subject) => {
    const deadlineDate = parseDateKey(subject.deadline);
    return deadlineDate > latest ? deadlineDate : latest;
  }, startDate);

  const dateRange = createDateRange(
    data.startDate,
    formatDateKey(addDays(latestDeadline, DAY_BUFFER)),
    data.blockedDates,
  );

  const sessions: StudySession[] = [];
  const warnings: string[] = [];

  for (const dateKey of dateRange) {
    let availableMinutes = Math.max(0, Math.round(data.dailyAvailabilityHours * 60));
    const currentDate = parseDateKey(dateKey);
    const scheduledToday = new Map<string, number>();
    let previousSubjectId: string | null = null;
    let dailyPomodoroCount = 0;

    while (availableMinutes > 0) {
      const subjectsWithWork = activeSubjects.filter((subject) => subject.remainingMinutes > 0);
      const subjectsUnderDailyTarget = subjectsWithWork.filter((subject) => {
        const scheduledMinutes = scheduledToday.get(subject.id) ?? 0;
        const dailyTarget = getDailyTargetMinutes(subject, dateRange, dateKey);
        const isPastDeadline = dateKey > subject.deadline;

        return isPastDeadline || scheduledMinutes < dailyTarget;
      });
      const candidatePool = subjectsUnderDailyTarget.length > 0 ? subjectsUnderDailyTarget : subjectsWithWork;
      const candidates = candidatePool
        .sort((left, right) => {
          const leftScheduledToday = scheduledToday.get(left.id) ?? 0;
          const rightScheduledToday = scheduledToday.get(right.id) ?? 0;
          const scoreDelta =
            calculateSubjectScore(right, currentDate, {
              previousSubjectId,
              scheduledTodayMinutes: rightScheduledToday,
              dailyTargetMinutes: getDailyTargetMinutes(right, dateRange, dateKey),
            }) -
            calculateSubjectScore(left, currentDate, {
              previousSubjectId,
              scheduledTodayMinutes: leftScheduledToday,
              dailyTargetMinutes: getDailyTargetMinutes(left, dateRange, dateKey),
            });
          if (scoreDelta !== 0) {
            return scoreDelta;
          }

          const deadlineDelta = new Date(left.deadline).getTime() - new Date(right.deadline).getTime();
          if (deadlineDelta !== 0) {
            return deadlineDelta;
          }

          return right.priority - left.priority;
        });

      if (candidates.length === 0) {
        break;
      }

      const nextSubject = candidates[0];
      const durationMinutes = Math.min(
        availableMinutes,
        nextSubject.remainingMinutes,
        POMODORO_MINUTES,
      );
      const isFinalShortBlock = nextSubject.remainingMinutes <= POMODORO_MINUTES;

      nextSubject.remainingMinutes -= durationMinutes;
      availableMinutes -= durationMinutes;
      dailyPomodoroCount += 1;
      scheduledToday.set(
        nextSubject.id,
        (scheduledToday.get(nextSubject.id) ?? 0) + durationMinutes,
      );
      previousSubjectId = nextSubject.id;

      sessions.push({
        id: `${dateKey}-${nextSubject.id}-${sessions.length + 1}`,
        sessionKey: `${nextSubject.id}-${sessions.length + 1}`,
        subjectId: nextSubject.id,
        subjectTitle: nextSubject.title,
        date: dateKey,
        plannedDate: dateKey,
        durationMinutes,
        blockType: isFinalShortBlock && nextSubject.initialRemainingMinutes > POMODORO_MINUTES ? "review" : "focus",
        pomodoroIndex: dailyPomodoroCount,
        breakAfterMinutes: availableMinutes > 0 ? getBreakAfterMinutes(dailyPomodoroCount) : null,
        priority: nextSubject.priority,
        deadline: nextSubject.deadline,
        status: "planned",
      });
    }
  }

  const totalHours = data.subjects.reduce((sum, subject) => sum + subject.totalHours, 0);
  const completedHours = data.subjects.reduce((sum, subject) => sum + subject.completedHours, 0);
  const remainingHours = Math.max(0, totalHours - completedHours);
  const totalAvailableMinutes = Math.round(dateRange.length * data.dailyAvailabilityHours * 60);
  const scheduledMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const overdueSubjects = data.subjects.filter(
    (subject) => subject.totalHours > subject.completedHours && parseDateKey(subject.deadline) < startDate,
  ).length;

  if (scheduledMinutes < Math.round(remainingHours * 60)) {
    warnings.push("Not enough availability to cover all remaining study hours.");
  }

  if (data.blockedDates.length > 0) {
    warnings.push("A missed day has been skipped and the plan was shifted forward.");
  }

  const sessionsWithOverrides = applySessionOverrides(sessions, data.sessionOverrides, dateRange)
    .map((s) => ({ ...s, status: data.completedSessions?.includes(s.sessionKey) ? ("completed" as const) : s.status }))
    .sort((left, right) => {
    if (left.date !== right.date) {
      return left.date.localeCompare(right.date);
    }

    if (left.pomodoroIndex !== right.pomodoroIndex) {
      return left.pomodoroIndex - right.pomodoroIndex;
    }

    return left.sessionKey.localeCompare(right.sessionKey);
  });

  return {
    sessions: sessionsWithOverrides,
    summary: {
      totalHours,
      remainingHours,
      completionRate: totalHours === 0 ? 0 : (completedHours / totalHours) * 100,
      overdueSubjects,
      scheduledMinutes,
      totalAvailableMinutes,
    },
    warnings,
  };
}
