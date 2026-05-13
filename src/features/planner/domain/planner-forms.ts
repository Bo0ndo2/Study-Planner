import type { PlannerData, Subject } from "@/types/planner";

export type SubjectFormValues = {
  title: string;
  priority: number;
  deadline: string;
  totalHours: number;
};

export type SubjectEditorValues = {
  title: string;
  priority: number;
  deadline: string;
  totalHours: number;
  completedHours: number;
};

export type SettingsFormValues = Pick<PlannerData, "dailyAvailabilityHours" | "startDate">;

export function createDefaultSubjectValues(today: string): SubjectFormValues {
  return {
    title: "",
    priority: 3,
    deadline: today,
    totalHours: 4,
  };
}

export function mapSubjectFormToSubject(values: SubjectFormValues): Subject {
  return {
    id: crypto.randomUUID(),
    title: values.title.trim(),
    priority: Number(values.priority),
    deadline: values.deadline,
    totalHours: Number(values.totalHours),
    completedHours: 0,
    subtasks: [],
  };
}

export function mapSubjectToEditorValues(subject: Subject): SubjectEditorValues {
  return {
    title: subject.title,
    priority: subject.priority,
    deadline: subject.deadline,
    totalHours: subject.totalHours,
    completedHours: subject.completedHours,
  };
}
