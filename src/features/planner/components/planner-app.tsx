"use client";

import { AppPreferencesProvider } from "@/context/app-preferences-context";
import { DashboardHeader } from "@/features/planner/components/dashboard-header";
import { InputsSection } from "@/features/planner/components/inputs-section";
import { PlannerNav } from "@/features/planner/components/planner-nav";
import { ProgressView } from "@/features/planner/components/progress-view";
import { ScheduleView } from "@/features/planner/components/schedule-view";
import { SummaryCards } from "@/features/planner/components/summary-cards";
import { getUniqueSessionDates, hasMissedDates } from "@/features/planner/domain/planner-selectors";
import { usePlanner } from "@/features/planner/hooks/usePlanner";

export function PlannerApp() {
  const {
    data,
    plan,
    lastMove,
    isLoading,
    isFetching,
    isSaving,
    loadError,
    saveError,
    updateData,
    addSubject,
    updateSubject,
    removeSubject,
    addSubtask,
    toggleSubtaskDone,
    removeSubtask,
    moveSession,
    undoLastMove,
    clearManualMoves,
    toggleTheme,
    markMissedToday,
    clearMissedDays,
    markSessionDone,
  } = usePlanner();

  const uniqueDates = getUniqueSessionDates(plan);

  return (
    <AppPreferencesProvider darkMode={data.darkMode} toggleTheme={toggleTheme}>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Planner</h2>
            <PlannerNav />
          </div>

          <DashboardHeader
            onMarkMissedDay={markMissedToday}
            onClearMissedDays={clearMissedDays}
            hasMissedDays={hasMissedDates(data)}
          />

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

          <SummaryCards
            plan={plan}
            subjectCount={data.subjects.length}
            planningDaysCount={uniqueDates.length}
          />

          {plan.warnings.length > 0 && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {plan.warnings[0]}
            </div>
          )}

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <InputsSection
                data={data}
                onUpdateData={updateData}
                onAddSubject={addSubject}
                onUpdateSubject={updateSubject}
                onRemoveSubject={removeSubject}
                onAddSubtask={addSubtask}
                onToggleSubtaskDone={toggleSubtaskDone}
                onRemoveSubtask={removeSubtask}
              />
            </div>

            <div className="space-y-6">
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

              <ProgressView subjects={data.subjects} />
            </div>
          </section>
        </div>
      </main>
    </AppPreferencesProvider>
  );
}
