"use client";

import { AppPreferencesProvider } from "@/context/app-preferences-context";
import { InputsSection } from "@/features/planner/components/inputs-section";
import { PlannerNav } from "@/features/planner/components/planner-nav";
import { usePlanner } from "@/features/planner/hooks/usePlanner";

export default function InputsPage() {
  const {
    data,
    updateData,
    addSubject,
    updateSubject,
    removeSubject,
    addSubtask,
    toggleSubtaskDone,
    removeSubtask,
    toggleTheme,
  } = usePlanner();

  return (
    <AppPreferencesProvider darkMode={data.darkMode} toggleTheme={toggleTheme}>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Inputs</h2>
            <PlannerNav />
          </div>

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
      </main>
    </AppPreferencesProvider>
  );
}
