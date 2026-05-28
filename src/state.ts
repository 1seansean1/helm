// Single-file state for Helm.
// Persists to localStorage under one versioned key; no server, no telemetry.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ModelId } from "./lib/models";
import { DEFAULT_MODEL } from "./lib/models";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface ExerciseRun {
  exerciseId: string;
  timestamp: number;
  model: string;
  temperature: number;
  max_tokens: number;
  system: string;
  user: string;
  response: string;
  mode: "live" | "simulated";
  error?: string;
}

export interface ModuleProgress {
  status: ProgressStatus;
  notes: string;
  exerciseRuns: ExerciseRun[];
}

export interface HelmState {
  version: 1;
  apiKey: string;
  defaultModel: ModelId;
  defaultTemperature: number;
  defaultMaxTokens: number;
  progress: Record<string, ModuleProgress>;
  tutorialCompleted: boolean;
}

const STORAGE_KEY = "helm.v1.state";

const FALLBACK: HelmState = {
  version: 1,
  apiKey: "",
  defaultModel: DEFAULT_MODEL,
  defaultTemperature: 0.5,
  defaultMaxTokens: 1024,
  progress: {},
  tutorialCompleted: false,
};

function loadInitial(): HelmState {
  if (typeof window === "undefined") return FALLBACK;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return FALLBACK;
    const parsed = JSON.parse(raw) as HelmState;
    if (parsed.version !== 1) return FALLBACK;
    return { ...FALLBACK, ...parsed, progress: parsed.progress ?? {} };
  } catch {
    return FALLBACK;
  }
}

interface Ctx {
  state: HelmState;
  setApiKey: (k: string) => void;
  forgetApiKey: () => void;
  setDefaultModel: (m: ModelId) => void;
  setDefaultTemperature: (t: number) => void;
  setDefaultMaxTokens: (m: number) => void;
  setModuleStatus: (moduleId: string, status: ProgressStatus) => void;
  setModuleNotes: (moduleId: string, notes: string) => void;
  recordExerciseRun: (moduleId: string, run: ExerciseRun) => void;
  setTutorialCompleted: (b: boolean) => void;
  resetAllProgress: () => void;
  resetAll: () => void;
}

const StateCtx = createContext<Ctx | null>(null);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HelmState>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota or private mode — silently skip */
    }
  }, [state]);

  const setApiKey = useCallback((k: string) => setState((s) => ({ ...s, apiKey: k.trim() })), []);
  const forgetApiKey = useCallback(() => setState((s) => ({ ...s, apiKey: "" })), []);
  const setDefaultModel = useCallback((m: ModelId) => setState((s) => ({ ...s, defaultModel: m })), []);
  const setDefaultTemperature = useCallback(
    (t: number) => setState((s) => ({ ...s, defaultTemperature: clamp(t, 0, 1) })),
    [],
  );
  const setDefaultMaxTokens = useCallback(
    (m: number) => setState((s) => ({ ...s, defaultMaxTokens: clamp(Math.round(m), 64, 8192) })),
    [],
  );

  const ensureModule = (s: HelmState, moduleId: string): HelmState => {
    if (s.progress[moduleId]) return s;
    return {
      ...s,
      progress: {
        ...s.progress,
        [moduleId]: { status: "not_started", notes: "", exerciseRuns: [] },
      },
    };
  };

  const setModuleStatus = useCallback((moduleId: string, status: ProgressStatus) => {
    setState((s) => {
      const next = ensureModule(s, moduleId);
      return {
        ...next,
        progress: {
          ...next.progress,
          [moduleId]: { ...next.progress[moduleId], status },
        },
      };
    });
  }, []);

  const setModuleNotes = useCallback((moduleId: string, notes: string) => {
    setState((s) => {
      const next = ensureModule(s, moduleId);
      return {
        ...next,
        progress: {
          ...next.progress,
          [moduleId]: { ...next.progress[moduleId], notes },
        },
      };
    });
  }, []);

  const recordExerciseRun = useCallback((moduleId: string, run: ExerciseRun) => {
    setState((s) => {
      const next = ensureModule(s, moduleId);
      const prev = next.progress[moduleId];
      // mark in_progress when first run lands; never downgrade
      const status: ProgressStatus = prev.status === "completed" ? "completed" : "in_progress";
      const runs = [run, ...prev.exerciseRuns].slice(0, 12); // keep last 12 per module
      return {
        ...next,
        progress: {
          ...next.progress,
          [moduleId]: { ...prev, status, exerciseRuns: runs },
        },
      };
    });
  }, []);

  const setTutorialCompleted = useCallback(
    (b: boolean) => setState((s) => ({ ...s, tutorialCompleted: b })),
    [],
  );

  const resetAllProgress = useCallback(() => setState((s) => ({ ...s, progress: {} })), []);
  const resetAll = useCallback(() => setState(FALLBACK), []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      setApiKey,
      forgetApiKey,
      setDefaultModel,
      setDefaultTemperature,
      setDefaultMaxTokens,
      setModuleStatus,
      setModuleNotes,
      recordExerciseRun,
      setTutorialCompleted,
      resetAllProgress,
      resetAll,
    }),
    [
      state,
      setApiKey,
      forgetApiKey,
      setDefaultModel,
      setDefaultTemperature,
      setDefaultMaxTokens,
      setModuleStatus,
      setModuleNotes,
      recordExerciseRun,
      setTutorialCompleted,
      resetAllProgress,
      resetAll,
    ],
  );

  return React.createElement(StateCtx.Provider, { value }, children);
}

export function useHelm(): Ctx {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error("useHelm called outside StateProvider");
  return ctx;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Helpers for tests + leadership-export
export function computeOverall(progress: Record<string, ModuleProgress>, totalModules: number) {
  let completed = 0;
  let inProgress = 0;
  for (const p of Object.values(progress)) {
    if (p.status === "completed") completed++;
    else if (p.status === "in_progress") inProgress++;
  }
  const notStarted = totalModules - completed - inProgress;
  return { completed, inProgress, notStarted, totalModules, percent: Math.round((completed / totalModules) * 100) };
}
