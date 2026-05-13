"use client";

import { AppPreferencesProvider } from "@/context/app-preferences-context";
import { ScheduleView } from "@/features/planner/components/schedule-view";
import { PlannerNav } from "@/features/planner/components/planner-nav";
import { ProgressView } from "@/features/planner/components/progress-view";
import { usePlanner } from "@/features/planner/hooks/usePlanner";

export default function SchedulePage() {
  const {
    data,
    plan,
    lastMove,
    isLoading,
    isFetching,
    isSaving,
    loadError,
    saveError,
    moveSession,
    undoLastMove,
    clearManualMoves,
    markSessionDone,
    toggleTheme,
  } = usePlanner();

  return (
    <AppPreferencesProvider darkMode={data.darkMode} toggleTheme={toggleTheme}>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Schedule</h2>
            <PlannerNav />
          </div>

          {(isLoading || isFetching || isSaving || loadError || saveError) && (
            <div className="rounded-lg border border-border bg-panel px-4 py-3 text-sm text-muted">
              {loadError
                ? "Remote planner data could not be loaded; local data is still available."
                : saveError
                ? "Changes were saved locally but could not sync to the API."
                : isSaving
                ? "Saving planner changes..."
                : "Refreshing planner data..."}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <ScheduleView
                sessions={plan.sessions}
                onMoveSession={(session, nextDate) =>
                  moveSession(session.sessionKey, session.date, nextDate, session.plannedDate)
                }
                onClearOverrides={clearManualMoves}
                onUndoLastMove={undoLastMove}
                canUndo={!!lastMove}
                onCompleteSession={markSessionDone}
                completedSessions={data.completedSessions}
              />
            </div>

            <div>
              <ProgressView subjects={data.subjects} />
            </div>
          </div>
        </div>
      </main>
    </AppPreferencesProvider>
  );
}
