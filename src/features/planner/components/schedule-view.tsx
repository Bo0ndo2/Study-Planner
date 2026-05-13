"use client";

import { useState } from "react";

import type { StudySession } from "@/types/planner";

interface ScheduleViewProps {
  sessions: StudySession[];
  onMoveSession: (session: StudySession, nextDate: string) => void;
  onClearOverrides: () => void;
  onUndoLastMove: () => void;
  canUndo: boolean;
  onCompleteSession?: (sessionKey: string, subjectId: string, minutes: number) => void;
  completedSessions?: string[];
}

function formatHours(minutes: number) {
  return `${(minutes / 60).toFixed(1)}h`;
}

function getUniqueDates(sessions: StudySession[]) {
  return Array.from(new Set(sessions.map((session) => session.date))).sort();
}

function getDateDisplayName(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);

  if (dateString === todayString) {
    return "Today";
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dateString === tomorrow.toISOString().slice(0, 10)) {
    return "Tomorrow";
  }

  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

export function ScheduleView({
  sessions,
  onMoveSession,
  onClearOverrides,
  onUndoLastMove,
  canUndo,
  onCompleteSession,
  completedSessions = [],
}: ScheduleViewProps) {
  const [draggedSession, setDraggedSession] = useState<StudySession | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const dates = getUniqueDates(sessions);

  return (
    <div className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">Generated schedule</h2>
          <p className="text-sm text-muted">
            Uses Pomodoro blocks with deadline pressure, spacing, and subject rotation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClearOverrides}
            className="rounded-md border border-border bg-panel px-3 py-2 text-sm font-medium transition hover:border-accent"
            title="Remove all manual overrides and restore auto schedule"
          >
            Clear overrides
          </button>
          <button
            type="button"
            onClick={onUndoLastMove}
            disabled={!canUndo}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
            title="Undo the last manual move"
          >
            Undo last move
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {dates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-6 text-sm text-muted">
            No scheduled sessions yet. Adjust the inputs above and the plan will populate here.
          </div>
        ) : (
          dates.map((date) => {
            const daySessions = sessions.filter((session) => session.date === date);

            return (
              <div
                key={date}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedSession) {
                    onMoveSession(draggedSession, date);
                    setDraggedSession(null);
                  }
                }}
                className="rounded-lg border border-border bg-background p-4 transition hover:border-accent/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{getDateDisplayName(date)}</h3>
                    <p className="text-xs text-muted">
                      {daySessions.length} sessions · {formatHours(daySessions.reduce((sum, session) => sum + session.durationMinutes, 0))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedDate((current) => (current === date ? null : date))}
                    className="rounded-md border border-border bg-panel px-3 py-2 text-sm font-medium transition hover:border-accent"
                  >
                    {expandedDate === date ? "Hide details" : "Show details"}
                  </button>
                </div>

                {expandedDate === date && (
                  <div className="mt-4 space-y-3">
                    {daySessions.map((session) => (
                      <article
                        key={session.id}
                        draggable
                        onDragStart={() => setDraggedSession(session)}
                        onDragEnd={() => setDraggedSession(null)}
                        className={`cursor-grab rounded-md border border-border bg-panel p-3.5 transition hover:border-accent/40 active:cursor-grabbing ${
                          draggedSession?.id === session.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{session.subjectTitle}</p>
                              <span className="rounded-sm bg-accentSoft px-2 py-0.5 text-[11px] font-medium text-accent">
                                {session.blockType === "review" ? "Review" : "Focus"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted">
                              Pomodoro {session.pomodoroIndex} · {session.durationMinutes} min · priority {session.priority}
                            </p>
                            {session.breakAfterMinutes && (
                              <p className="mt-1 text-xs text-muted">Break: {session.breakAfterMinutes} min</p>
                            )}
                          </div>
                            <div className="flex flex-col items-end gap-2">
                              <button
                                type="button"
                                onClick={() => onCompleteSession?.(session.sessionKey, session.subjectId, session.durationMinutes)}
                                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                                  completedSessions.includes(session.sessionKey)
                                    ? "bg-success/20 text-success hover:bg-success/30"
                                    : "bg-success/10 text-success hover:opacity-90"
                                }`}
                              >
                                {completedSessions.includes(session.sessionKey) ? "✓ Completed" : "Complete"}
                              </button>
                              <span
                            className={`text-xs font-semibold ${
                              session.status === "moved" ? "text-success" : "text-muted"
                            }`}
                          >
                            {session.status === "moved" ? "moved" : "planned"}
                              </span>
                            </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
