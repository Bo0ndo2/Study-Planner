import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Study Planner Pro | Next.js React Portfolio Project",
  description:
    "Feature-first study planner built with Next.js, React, TypeScript, React Query, Axios, Formik, Yup, Context API, and Vitest.",
  keywords: [
    "Next.js",
    "React",
    "TypeScript",
    "React Query",
    "Axios",
    "Formik",
    "Yup",
    "Context API",
    "Frontend Portfolio",
    "Study Planner",
  ],
  openGraph: {
    title: "Study Planner Pro",
    description:
      "A portfolio-grade Next.js planner demonstrating React Query, Axios, Formik, Yup, Context API, and testable domain logic.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
