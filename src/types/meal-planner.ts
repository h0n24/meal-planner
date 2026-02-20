export type MealType = "breakfast" | "lunch" | "dinner";

export type Ingredient = {
  id: string;
  section: string;
  name: string;
  amount: number;
  unit: string;
};

export type Recipe = {
  id: string;
  name: string;
  ingredients: Ingredient[];
  notes: string;
};

export type WeekPlan = Record<string, Record<MealType, string | null>>;

export type PlannerState = {
  recipes: Recipe[];
  weekPlan: WeekPlan;
  checkedShopping: string[];
};
