"use client";

import { useCallback, useMemo, useState } from "react";

import {
  addPlannerSubject,
  addPlannerSubtask,
  clearPlannerMissedDates,
  clearPlannerSessionOverrides,
  type LastSessionMove,
  markPlannerDateMissed,
  mergePlannerData,
  removePlannerSubject,
  removePlannerSubtask,
  setPlannerSessionOverride,
  togglePlannerTheme,
  togglePlannerSubtask,
  updatePlannerSubject,
  addCompletedMinutesToSubject,
  type SubjectField,
  togglePlannerSessionCompleted,
} from "@/features/planner/domain/planner-actions";
import { usePlannerData } from "@/features/planner/hooks/usePlannerData";
import { generateStudyPlan } from "@/lib/planner";
import type { PlannerData, Subject } from "@/types/planner";

export function usePlanner() {
  const { data, setData, isLoading, isFetching, isSaving, loadError, saveError } = usePlannerData();
  const [lastMove, setLastMove] = useState<LastSessionMove | null>(null);

  const plan = useMemo(() => generateStudyPlan(data), [data]);

  const updateData = useCallback(
    (partialData: Partial<PlannerData>) => {
      setData((current) => mergePlannerData(current, partialData));
    },
    [setData],
  );

  const addSubject = useCallback(
    (subject: Subject) => {
      setData((current) => addPlannerSubject(current, subject));
    },
    [setData],
  );

  const updateSubject = useCallback(
    (id: string, field: SubjectField, value: string | number) => {
      setData((current) => updatePlannerSubject(current, id, field, value));
    },
    [setData],
  );

  const removeSubject = useCallback(
    (id: string) => {
      setData((current) => removePlannerSubject(current, id));
    },
    [setData],
  );

  const addSubtask = useCallback(
    (subjectId: string, title: string) => {
      setData((current) => addPlannerSubtask(current, subjectId, title));
    },
    [setData],
  );

  const toggleSubtaskDone = useCallback(
    (subjectId: string, subtaskId: string) => {
      setData((current) => togglePlannerSubtask(current, subjectId, subtaskId));
    },
    [setData],
  );

  const removeSubtask = useCallback(
    (subjectId: string, subtaskId: string) => {
      setData((current) => removePlannerSubtask(current, subjectId, subtaskId));
    },
    [setData],
  );

  const moveSession = useCallback(
    (sessionKey: string, previousDate: string, nextDate: string, plannedDate: string) => {
      if (previousDate === nextDate) {
        return;
      }

      setLastMove({ sessionKey, previousDate, nextDate });
      setData((current) => setPlannerSessionOverride(current, sessionKey, nextDate, plannedDate));
    },
    [setData],
  );

  const undoLastMove = useCallback(() => {
    if (!lastMove) {
      return;
    }

    const targetSession = plan.sessions.find((session) => session.sessionKey === lastMove.sessionKey);

    if (!targetSession) {
      setLastMove(null);
      return;
    }

    setData((current) =>
      setPlannerSessionOverride(current, lastMove.sessionKey, lastMove.previousDate, targetSession.plannedDate),
    );
    setLastMove(null);
  }, [lastMove, plan.sessions, setData]);

  const clearManualMoves = useCallback(() => {
    setData(clearPlannerSessionOverrides);
    setLastMove(null);
  }, [setData]);

  const toggleTheme = useCallback(() => {
    setData(togglePlannerTheme);
  }, [setData]);

  const markMissedToday = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setData((current) => markPlannerDateMissed(current, today));
  }, [setData]);

  const clearMissedDays = useCallback(() => {
    setData(clearPlannerMissedDates);
  }, [setData]);

  const markSessionDone = useCallback(
    (sessionKey: string, subjectId: string, minutes: number) => {
      setData((current) => addCompletedMinutesToSubject(current, subjectId, minutes));
      setData((current) => togglePlannerSessionCompleted(current, sessionKey));
    },
    [setData],
  );

  return {
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
    markSessionDone,
    moveSession,
    undoLastMove,
    clearManualMoves,
    toggleTheme,
    markMissedToday,
    clearMissedDays,
  };
}
