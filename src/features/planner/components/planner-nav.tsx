"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/planner/inputs", label: "Inputs" },
  { href: "/planner/schedule", label: "Schedule" },
  { href: "/planner/summary", label: "Summary" },
] as const;

export function PlannerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "border-accent bg-accent text-white"
                : "border-border bg-background text-foreground hover:border-accent hover:text-accent"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}