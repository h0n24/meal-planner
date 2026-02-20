import type { Recipe } from "@/types/recipe";

const LOCAL_STORAGE_KEY = "meal-planner-recipes";

function readLocalRecipes(): Recipe[] {
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Recipe[];
  } catch {
    return [];
  }
}

function writeLocalRecipes(recipes: Recipe[]) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recipes));
}

export async function fetchRecipes(storageMode: "client" | "postgres"): Promise<Recipe[]> {
  if (storageMode === "client") {
    return readLocalRecipes();
  }

  const response = await fetch("/api/recipes", { cache: "no-store" });
  const data = await response.json();
  return data.recipes ?? [];
}

export async function createRecipe(
  storageMode: "client" | "postgres",
  payload: { name: string; instructions?: string }
): Promise<void> {
  if (storageMode === "client") {
    const existing = readLocalRecipes();
    const next: Recipe[] = [
      {
        id: crypto.randomUUID(),
        name: payload.name,
        instructions: payload.instructions ?? ""
      },
      ...existing
    ];
    writeLocalRecipes(next);
    return;
  }

  const response = await fetch("/api/recipes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Could not save recipe");
  }
}
