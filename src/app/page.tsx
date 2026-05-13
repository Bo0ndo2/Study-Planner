import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-semibold">Study Planner</h1>
        <p className="mb-8 text-muted">Choose a section to open:</p>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/planner/inputs" className="rounded-lg border border-border bg-panel px-4 py-6 text-center hover:shadow">
            <div className="text-lg font-medium">Inputs</div>
            <div className="text-sm text-muted">Manage subjects & tasks</div>
          </Link>

          <Link href="/planner/schedule" className="rounded-lg border border-border bg-panel px-4 py-6 text-center hover:shadow">
            <div className="text-lg font-medium">Schedule</div>
            <div className="text-sm text-muted">View & move sessions</div>
          </Link>

          <Link href="/planner/summary" className="rounded-lg border border-border bg-panel px-4 py-6 text-center hover:shadow">
            <div className="text-lg font-medium">Summary</div>
            <div className="text-sm text-muted">Progress and overview</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
