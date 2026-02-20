import { MealType, PlannerState, Recipe, WeekPlan } from "@/types/meal-planner";

export const DAYS = [
  "Pondělí",
  "Úterý",
  "Středa",
  "Čtvrtek",
  "Pátek",
  "Sobota",
  "Neděle"
] as const;

export const MEALS: MealType[] = ["breakfast", "lunch", "dinner"];

export function createDefaultWeekPlan(): WeekPlan {
  return DAYS.reduce((acc, day) => {
    acc[day] = { breakfast: null, lunch: null, dinner: null };
    return acc;
  }, {} as WeekPlan);
}

export function createInitialState(): PlannerState {
  return {
    recipes: [],
    weekPlan: createDefaultWeekPlan(),
    checkedShopping: []
  };
}

export function deriveShoppingList(recipes: Recipe[], weekPlan: WeekPlan) {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const grouped: Record<string, Record<string, number>> = {};

  for (const day of DAYS) {
    for (const meal of MEALS) {
      const recipeId = weekPlan[day]?.[meal];
      if (!recipeId) {
        continue;
      }
      const recipe = recipeMap.get(recipeId);
      if (!recipe) {
        continue;
      }

      for (const ingredient of recipe.ingredients) {
        const section = ingredient.section.trim() || "Ostatní";
        const key = `${ingredient.name.trim()}|${ingredient.unit.trim() || "ks"}`;
        if (!grouped[section]) {
          grouped[section] = {};
        }
        grouped[section][key] = (grouped[section][key] ?? 0) + ingredient.amount;
      }
    }
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b, "cs"))
    .map(([section, items]) => ({
      section,
      items: Object.entries(items)
        .map(([compound, amount]) => {
          const [name, unit] = compound.split("|");
          return {
            id: `${section}|${name}|${unit}`,
            name,
            unit,
            amount
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, "cs"))
    }));
}
