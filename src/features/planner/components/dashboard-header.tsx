"use client";

import { useAppPreferences } from "@/context/app-preferences-context";

interface DashboardHeaderProps {
  onMarkMissedDay: () => void;
  onClearMissedDays: () => void;
  hasMissedDays: boolean;
}

export function DashboardHeader({
  onMarkMissedDay,
  onClearMissedDays,
  hasMissedDays,
}: DashboardHeaderProps) {
  const { darkMode, toggleTheme } = useAppPreferences();
  const { compactMode, toggleCompact } = useAppPreferences();

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-hero-grid shadow-glow">
      <div className="border-b border-border/70 bg-panel/70 px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" />
            <span className="text-sm font-semibold">Study Planner Pro</span>
            <span className="hidden text-xs text-muted sm:inline">Deadline-aware planning workspace</span>
          </div>
          <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted">
            {darkMode ? "Dark workspace" : "Light workspace"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 px-5 py-7 lg:grid-cols-[1fr_320px] lg:items-end">
        <div className="max-w-3xl space-y-4">
          <div className="space-y-3">
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
              Plan the week around deadlines, progress, and real availability.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              A calm planner surface for subjects, generated sessions, missed days, and manual schedule changes.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-panel/80 p-3">
          <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md bg-background px-2 py-2">
              <p className="font-semibold text-foreground">Plan</p>
              <p className="text-muted">Live</p>
            </div>
            <div className="rounded-md bg-background px-2 py-2">
              <p className="font-semibold text-foreground">Sync</p>
              <p className="text-muted">Ready</p>
            </div>
            <div className="rounded-md bg-background px-2 py-2">
              <p className="font-semibold text-foreground">Mode</p>
              <p className="text-muted">Focus</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
            title="Toggle between light and dark mode"
          >
            {darkMode ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            onClick={toggleCompact}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-accent"
            title="Toggle compact subject list"
          >
            {compactMode ? "Detailed" : "Compact"}
          </button>
          <button
            type="button"
            onClick={onMarkMissedDay}
            className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            title="Mark today as missed and reschedule remaining tasks"
          >
            Missed today
          </button>
          {hasMissedDays && (
            <button
              type="button"
              onClick={onClearMissedDays}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-accent"
              title="Clear all missed days and restore original schedule"
            >
              Clear
            </button>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
