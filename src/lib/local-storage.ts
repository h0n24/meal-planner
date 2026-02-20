import { PlannerState } from "@/types/meal-planner";
import { createInitialState } from "@/lib/planner-utils";

const STORAGE_KEY = "meal-planner-v2";

export function loadPlannerState(): PlannerState {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(raw) as PlannerState;
    return {
      recipes: parsed.recipes ?? [],
      weekPlan: parsed.weekPlan ?? createInitialState().weekPlan,
      checkedShopping: parsed.checkedShopping ?? []
    };
  } catch {
    return createInitialState();
  }
}

export function savePlannerState(state: PlannerState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
