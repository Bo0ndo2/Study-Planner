"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type AppPreferencesContextValue = {
  darkMode: boolean;
  toggleTheme: () => void;
  compactMode: boolean;
  toggleCompact: () => void;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({
  children,
  darkMode,
  toggleTheme,
}: {
  children: ReactNode;
  darkMode: boolean;
  toggleTheme: () => void;
}) {
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleCompact = useCallback(() => setCompactMode((s) => !s), []);

  const value = useMemo(() => ({ darkMode, toggleTheme, compactMode, toggleCompact }), [
    darkMode,
    toggleTheme,
    compactMode,
    toggleCompact,
  ]);

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error("useAppPreferences must be used inside AppPreferencesProvider");
  }

  return context;
}
