"use client";

import { AppPreferencesProvider } from "@/context/app-preferences-context";
import { DashboardHeader } from "@/features/planner/components/dashboard-header";
import { PlannerNav } from "@/features/planner/components/planner-nav";
import { SummaryCards } from "@/features/planner/components/summary-cards";
import { getUniqueSessionDates, hasMissedDates } from "@/features/planner/domain/planner-selectors";
import { usePlanner } from "@/features/planner/hooks/usePlanner";

export default function SummaryPage() {
  const {
    data,
    plan,
    lastMove,
    isLoading,
    isFetching,
    isSaving,
    loadError,
    saveError,
    toggleTheme,
    markMissedToday,
    clearMissedDays,
  } = usePlanner();

  const uniqueDates = getUniqueSessionDates(plan);

  return (
    <AppPreferencesProvider darkMode={data.darkMode} toggleTheme={toggleTheme}>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Summary</h2>
            <PlannerNav />
          </div>

          <DashboardHeader
            onMarkMissedDay={markMissedToday}
            onClearMissedDays={clearMissedDays}
            hasMissedDays={hasMissedDates(data)}
          />

          {(isLoading || isFetching || isSaving || loadError || saveError) && (
            <div className="rounded-lg border border-border bg-panel px-4 py-3 text-sm text-muted mt-4">
              {loadError
                ? "Remote planner data could not be loaded; local data is still available."
                : saveError
                ? "Changes were saved locally but could not sync to the API."
                : isSaving
                ? "Saving planner changes..."
                : "Refreshing planner data..."}
            </div>
          )}

          <div className="mt-6">
            <SummaryCards plan={plan} subjectCount={data.subjects.length} planningDaysCount={uniqueDates.length} />
          </div>
        </div>
      </main>
    </AppPreferencesProvider>
  );
}
