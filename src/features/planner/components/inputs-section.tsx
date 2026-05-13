"use client";

import { ErrorMessage, Field, Form, Formik, type FormikHelpers, type FormikProps } from "formik";
import { useCallback, useMemo, useState } from "react";
import { useAppPreferences } from "@/context/app-preferences-context";

import {
  createDefaultSubjectValues,
  mapSubjectFormToSubject,
  mapSubjectToEditorValues,
  type SettingsFormValues,
  type SubjectEditorValues,
  type SubjectFormValues,
} from "@/features/planner/domain/planner-forms";
import { getSubjectCompletion } from "@/features/planner/domain/planner-selectors";
import { settingsSchema, subjectEditorSchema, subjectSchema } from "@/features/planner/schemas";
import type { PlannerData, Subject } from "@/types/planner";

interface InputsSectionProps {
  data: PlannerData;
  onUpdateData: (partial: Partial<PlannerData>) => void;
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (id: string, field: keyof Subject, value: string | number) => void;
  onRemoveSubject: (id: string) => void;
  onAddSubtask: (subjectId: string, title: string) => void;
  onToggleSubtaskDone: (subjectId: string, subtaskId: string) => void;
  onRemoveSubtask: (subjectId: string, subtaskId: string) => void;
}

type PlannerFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  title?: string;
  helperText?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
};

function PlannerField({ label, name, type = "text", placeholder, title, helperText, min, max, step }: PlannerFieldProps) {
  return (
    <label className="space-y-1 text-sm">
      <span className="block font-medium text-foreground">{label}</span>
      <Field
        name={name}
        type={type}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        title={title}
        className="w-full rounded-md border border-border bg-panel px-3.5 py-2.5 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
      />
      {helperText && <span className="block text-xs leading-5 text-muted">{helperText}</span>}
      <ErrorMessage name={name} component="div" className="text-xs text-danger" />
    </label>
  );
}

function submitOnBlur<TValues>(formik: FormikProps<TValues>) {
  return () => {
    void formik.submitForm();
  };
}

function SettingsForm({
  values,
  onSubmit,
}: {
  values: SettingsFormValues;
  onSubmit: (values: SettingsFormValues) => void;
}) {
  return (
    <Formik initialValues={values} validationSchema={settingsSchema} onSubmit={onSubmit} enableReinitialize>
      {(formik) => (
        <Form className="grid gap-4 sm:grid-cols-2" onBlur={submitOnBlur(formik)}>
          <PlannerField
            label="Daily availability"
            name="dailyAvailabilityHours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            placeholder="e.g. 3"
            title="Total study hours available per day"
            helperText="Focused study hours available per day. Breaks are suggested separately."
          />
          <PlannerField
            label="Plan start date"
            name="startDate"
            type="date"
            title="Date when study plan begins"
            helperText="The first day the scheduler is allowed to place Pomodoro blocks."
          />
        </Form>
      )}
    </Formik>
  );
}

function SubjectCreateForm({
  initialValues,
  onSubmit,
}: {
  initialValues: SubjectFormValues;
  onSubmit: (values: SubjectFormValues, helpers: FormikHelpers<SubjectFormValues>) => void;
}) {
  return (
    <Formik initialValues={initialValues} validationSchema={subjectSchema} onSubmit={onSubmit}>
      <Form className="grid gap-3 md:grid-cols-[2fr_0.8fr_0.8fr_0.8fr_auto]">
        <PlannerField
          label="Subject or task"
          name="title"
          placeholder="e.g. Biology - Cell Division"
          title="Name of the subject"
          helperText="Use a chapter, course, or task name."
        />
        <PlannerField
          label="Priority"
          name="priority"
          type="number"
          min={1}
          max={5}
          placeholder="1-5"
          title="Priority level"
          helperText="1 = low, 5 = exam-critical."
        />
        <PlannerField
          label="Deadline"
          name="deadline"
          type="date"
          title="When this subject must be completed"
          helperText="Exam date or delivery date."
        />
        <PlannerField
          label="Hours left"
          name="totalHours"
          type="number"
          min={0.5}
          step={0.5}
          placeholder="e.g. 6"
          title="Total hours needed"
          helperText="Estimated total focused hours needed."
        />
        <button type="submit" className="self-start rounded-md bg-accent px-4 py-2.5 font-semibold text-white transition hover:opacity-90 md:mt-6">
          Add
        </button>
      </Form>
    </Formik>
  );
}

function SubjectEditor({
  subject,
  onUpdateSubject,
  onRemoveSubject,
  onAddSubtask,
  onToggleSubtaskDone,
  onRemoveSubtask,
  defaultCollapsed = false,
}: {
  subject: Subject;
  onUpdateSubject: (id: string, field: keyof Subject, value: string | number) => void;
  onRemoveSubject: (id: string) => void;
  onAddSubtask: (subjectId: string, title: string) => void;
  onToggleSubtaskDone: (subjectId: string, subtaskId: string) => void;
  onRemoveSubtask: (subjectId: string, subtaskId: string) => void;
  defaultCollapsed?: boolean;
}) {
  const completion = getSubjectCompletion(subject);
  const [showDetails, setShowDetails] = useState(!defaultCollapsed);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const completedSubtasks = subject.subtasks.filter((subtask) => subtask.done).length;

  const handleSubmit = (values: SubjectEditorValues) => {
    onUpdateSubject(subject.id, "title", values.title.trim());
    onUpdateSubject(subject.id, "priority", Number(values.priority));
    onUpdateSubject(subject.id, "deadline", values.deadline);
    onUpdateSubject(subject.id, "totalHours", Number(values.totalHours));
    onUpdateSubject(subject.id, "completedHours", Number(values.completedHours));
  };

  return (
    <article className="rounded-lg border border-border bg-background p-4 transition hover:border-accent/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">{subject.title}</h3>
            <span className="rounded-full bg-accentSoft px-2 py-0.5 text-[11px] font-medium text-accent">
              {Math.round(completion)}%
            </span>
          </div>
          <p className="text-xs leading-5 text-muted">
            Priority {subject.priority} · Deadline {subject.deadline} · {subject.completedHours}h of {subject.totalHours}h done ·
            {" "}{completedSubtasks}/{subject.subtasks.length} subtasks done
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            className="rounded-md border border-border bg-panel px-3 py-2 text-sm transition hover:border-accent"
            title={showDetails ? "Hide task details" : "Show task details"}
          >
            {showDetails ? "Hide details" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => onRemoveSubject(subject.id)}
            className="rounded-md border border-border px-3 py-2 text-sm transition hover:border-danger hover:text-danger"
            title="Delete subject"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="mt-4 h-2 rounded-sm bg-panelAlt">
        <div
          className="h-2 rounded-sm bg-gradient-to-r from-accent to-success transition-all duration-300"
          style={{ width: `${completion}%` }}
        />
      </div>

      {showDetails && (
        <div className="mt-4 space-y-4">
          <Formik
            initialValues={mapSubjectToEditorValues(subject)}
            validationSchema={subjectEditorSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(formik) => (
              <Form className="grid gap-3 md:grid-cols-[2fr_0.6fr_0.9fr_0.9fr_0.6fr]" onBlur={submitOnBlur(formik)}>
                <PlannerField
                  label="Subject"
                  name="title"
                  placeholder="e.g. Chemistry - Organic"
                  helperText="What should appear on the schedule."
                />
                <PlannerField
                  label="Priority"
                  name="priority"
                  type="number"
                  min={1}
                  max={5}
                  title="Priority"
                  helperText="1 low, 5 urgent."
                />
                <PlannerField
                  label="Deadline"
                  name="deadline"
                  type="date"
                  title="Deadline"
                  helperText="Used for deadline pressure."
                />
                <PlannerField
                  label="Total hours"
                  name="totalHours"
                  type="number"
                  min={0.5}
                  step={0.5}
                  placeholder="e.g. 8"
                  title="Total hours needed"
                  helperText="Full estimated effort."
                />
                <PlannerField
                  label="Done"
                  name="completedHours"
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="e.g. 1.5"
                  title="Hours completed"
                  helperText="Already finished hours."
                />
              </Form>
            )}
          </Formik>

          <div className="rounded-lg border border-border bg-panel/40 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(event) => setNewSubtaskTitle(event.target.value)}
                placeholder="Add a subtask"
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
              <button
                type="button"
                onClick={() => {
                  onAddSubtask(subject.id, newSubtaskTitle);
                  setNewSubtaskTitle("");
                }}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Add subtask
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {subject.subtasks.length === 0 ? (
                <p className="text-sm text-muted">No subtasks yet.</p>
              ) : (
                subject.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className={`truncate text-sm ${subtask.done ? "text-muted line-through" : "font-medium"}`}>
                        {subtask.title}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleSubtaskDone(subject.id, subtask.id)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                          subtask.done
                            ? "border-success text-success"
                            : "border-border hover:border-accent hover:text-accent"
                        }`}
                      >
                        {subtask.done ? "Done" : "Mark done"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveSubtask(subject.id, subtask.id)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition hover:border-danger hover:text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export function InputsSection({
  data,
  onUpdateData,
  onAddSubject,
  onUpdateSubject,
  onRemoveSubject,
  onAddSubtask,
  onToggleSubtaskDone,
  onRemoveSubtask,
}: InputsSectionProps) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const initialSubject = useMemo(() => createDefaultSubjectValues(today), [today]);
  const { compactMode } = useAppPreferences();
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = compactMode ? 4 : 3;

  const totalPages = Math.max(1, Math.ceil(data.subjects.length / pageSize));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);

  const visibleSubjects = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * pageSize;
    return data.subjects.slice(startIndex, startIndex + pageSize);
  }, [data.subjects, effectiveCurrentPage, pageSize]);

  const handleSubmitSubject = useCallback(
    (values: SubjectFormValues, helpers: FormikHelpers<SubjectFormValues>) => {
      onAddSubject(mapSubjectFormToSubject(values));
      helpers.resetForm();
    },
    [onAddSubject],
  );

  return (
    <div className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Inputs</h2>
          <p className="text-sm text-muted">
            Add work estimates and the planner splits them into 25-minute Pomodoro focus blocks.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <SettingsForm
          values={{ dailyAvailabilityHours: data.dailyAvailabilityHours, startDate: data.startDate }}
          onSubmit={onUpdateData}
        />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background p-4">
        <SubjectCreateForm initialValues={initialSubject} onSubmit={handleSubmitSubject} />
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm">
          <div className="text-muted">
            Page {effectiveCurrentPage} of {totalPages} · {data.subjects.length} tasks
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={effectiveCurrentPage === 1}
              className="rounded-md border border-border bg-panel px-3 py-1.5 font-medium transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={effectiveCurrentPage === totalPages}
              className="rounded-md border border-border bg-panel px-3 py-1.5 font-medium transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {visibleSubjects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-6 text-sm text-muted">
            No tasks on this page yet. Add one above or move to another page.
          </div>
        ) : compactMode ? (
          <div className="grid gap-3">
            {visibleSubjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{subject.title}</div>
                  <div className="text-xs text-muted">
                    {Math.round(getSubjectCompletion(subject))}% • {subject.totalHours}h • {subject.subtasks.length} subtasks
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSubject(subject)}
                    className="rounded-md border border-border bg-background px-3 py-1 text-sm transition hover:border-accent"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveSubject(subject.id)}
                    className="rounded-md border border-border px-3 py-1 text-sm transition hover:border-danger hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleSubjects.map((subject) => (
              <SubjectEditor
                key={subject.id}
                subject={subject}
                onUpdateSubject={onUpdateSubject}
                onRemoveSubject={onRemoveSubject}
                onAddSubtask={onAddSubtask}
                onToggleSubtaskDone={onToggleSubtaskDone}
                onRemoveSubtask={onRemoveSubtask}
                defaultCollapsed
              />
            ))}
          </div>
        )}
      </div>

      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingSubject(null)} />
          <div className="relative w-full max-w-3xl rounded-lg bg-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit subject</h3>
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                className="text-sm text-muted"
              >
                Close
              </button>
            </div>
            <SubjectEditor
              subject={editingSubject}
              onUpdateSubject={(id, field, value) => {
                onUpdateSubject(id, field, value);
              }}
              onRemoveSubject={(id) => {
                onRemoveSubject(id);
                setEditingSubject(null);
              }}
              onAddSubtask={onAddSubtask}
              onToggleSubtaskDone={onToggleSubtaskDone}
              onRemoveSubtask={onRemoveSubtask}
              defaultCollapsed={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
