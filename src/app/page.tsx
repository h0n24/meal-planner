"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DAYS, MEALS, deriveShoppingList } from "@/lib/planner-utils";
import { loadPlannerState, savePlannerState } from "@/lib/local-storage";
import type { Ingredient, MealType, PlannerState, Recipe } from "@/types/meal-planner";

type View = "shopping" | "recipes" | "week";

type IngredientInput = Omit<Ingredient, "id">;

const mealLabels: Record<MealType, string> = {
  breakfast: "Snídaně",
  lunch: "Oběd",
  dinner: "Večeře"
};

const defaultIngredient = (): IngredientInput => ({
  section: "Ovoce & Zelenina",
  name: "",
  amount: 1,
  unit: "ks"
});

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function HomePage() {
  const [activeView, setActiveView] = useState<View>("week");
  const [state, setState] = useState<PlannerState | null>(null);
  const [draggedRecipeId, setDraggedRecipeId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [ingredients, setIngredients] = useState<IngredientInput[]>([defaultIngredient()]);
  const [error, setError] = useState("");

  useEffect(() => {
    setState(loadPlannerState());
  }, []);

  useEffect(() => {
    if (state) {
      savePlannerState(state);
    }
  }, [state]);

  const recipeUsage = useMemo(() => {
    if (!state) {
      return new Map<string, number>();
    }
    const usage = new Map<string, number>();
    for (const day of DAYS) {
      for (const meal of MEALS) {
        const recipeId = state.weekPlan[day][meal];
        if (!recipeId) {
          continue;
        }
        usage.set(recipeId, (usage.get(recipeId) ?? 0) + 1);
      }
    }
    return usage;
  }, [state]);

  const shopping = useMemo(() => {
    if (!state) {
      return [];
    }
    return deriveShoppingList(state.recipes, state.weekPlan);
  }, [state]);

  function addIngredientRow() {
    setIngredients((current) => [...current, defaultIngredient()]);
  }

  function updateIngredient(index: number, patch: Partial<IngredientInput>) {
    setIngredients((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function removeIngredient(index: number) {
    setIngredients((current) => (current.length <= 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  }

  function submitRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!state) {
      return;
    }

    const normalized = ingredients
      .map((item) => ({
        ...item,
        section: item.section.trim(),
        name: item.name.trim(),
        unit: item.unit.trim() || "ks"
      }))
      .filter((item) => item.name && item.amount > 0);

    if (!name.trim()) {
      setError("Název receptu je povinný.");
      return;
    }

    if (normalized.length === 0) {
      setError("Zadej alespoň jednu surovinu s množstvím.");
      return;
    }

    const recipe: Recipe = {
      id: createId(),
      name: name.trim(),
      notes: notes.trim(),
      ingredients: normalized.map((item) => ({ ...item, id: createId() }))
    };

    setState({ ...state, recipes: [...state.recipes, recipe] });
    setName("");
    setNotes("");
    setIngredients([defaultIngredient()]);
    setError("");
  }

  function deleteRecipe(recipeId: string) {
    if (!state) {
      return;
    }

    const weekPlan = { ...state.weekPlan };
    for (const day of DAYS) {
      for (const meal of MEALS) {
        if (weekPlan[day][meal] === recipeId) {
          weekPlan[day] = { ...weekPlan[day], [meal]: null };
        }
      }
    }

    setState({
      ...state,
      recipes: state.recipes.filter((recipe) => recipe.id !== recipeId),
      weekPlan
    });
  }

  function assignRecipe(day: string, meal: MealType, recipeId: string | null) {
    if (!state) {
      return;
    }

    setState({
      ...state,
      weekPlan: {
        ...state.weekPlan,
        [day]: {
          ...state.weekPlan[day],
          [meal]: recipeId
        }
      }
    });
  }

  function toggleShoppingItem(itemId: string) {
    if (!state) {
      return;
    }
    const nextChecked = state.checkedShopping.includes(itemId)
      ? state.checkedShopping.filter((id) => id !== itemId)
      : [...state.checkedShopping, itemId];

    setState({ ...state, checkedShopping: nextChecked });
  }

  if (!state) {
    return <main className="mx-auto max-w-6xl p-4">Načítám…</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-4 md:p-8">
      <header className="mb-5 rounded-2xl bg-slate-900 p-4 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Meal planner (localStorage)</h1>
        <p className="text-sm text-slate-200">Recepty určují nákup. Týdenní plán funguje přes drag & drop.</p>
      </header>

      <nav className="mb-5 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveView("shopping")}
          className={`rounded-xl p-2 text-sm font-semibold ${
            activeView === "shopping" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-900"
          }`}
        >
          Nákup
        </button>
        <button
          type="button"
          onClick={() => setActiveView("recipes")}
          className={`rounded-xl p-2 text-sm font-semibold ${
            activeView === "recipes" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-900"
          }`}
        >
          Recepty
        </button>
        <button
          type="button"
          onClick={() => setActiveView("week")}
          className={`rounded-xl p-2 text-sm font-semibold ${
            activeView === "week" ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-900"
          }`}
        >
          Týden
        </button>
      </nav>

      {activeView === "recipes" ? (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-amber-900">Recepty</h2>
          <p className="mb-4 text-sm text-amber-800">Podle těchto surovin se automaticky přepočítá nákupní seznam.</p>

          <form onSubmit={submitRecipe} className="space-y-3 rounded-xl bg-white p-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Název receptu</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Poznámky / postup</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Suroviny (styl jako v XLSX: sekce + množství + jednotka)</div>
              {ingredients.map((ingredient, index) => (
                <div key={`ingredient-${index}`} className="grid grid-cols-12 gap-2 rounded-lg border border-slate-200 p-2">
                  <input
                    value={ingredient.section}
                    onChange={(event) => updateIngredient(index, { section: event.target.value })}
                    placeholder="Sekce"
                    className="col-span-12 rounded border border-slate-300 px-2 py-1 md:col-span-3"
                  />
                  <input
                    value={ingredient.name}
                    onChange={(event) => updateIngredient(index, { name: event.target.value })}
                    placeholder="Surovina"
                    className="col-span-12 rounded border border-slate-300 px-2 py-1 md:col-span-4"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ingredient.amount}
                    onChange={(event) => updateIngredient(index, { amount: Number(event.target.value) })}
                    placeholder="Množství"
                    className="col-span-6 rounded border border-slate-300 px-2 py-1 md:col-span-2"
                  />
                  <input
                    value={ingredient.unit}
                    onChange={(event) => updateIngredient(index, { unit: event.target.value })}
                    placeholder="Jednotka"
                    className="col-span-4 rounded border border-slate-300 px-2 py-1 md:col-span-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="col-span-2 rounded bg-rose-100 px-2 py-1 text-rose-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addIngredientRow} className="rounded-lg bg-slate-200 px-3 py-1 text-sm">
                + Přidat surovinu
              </button>
            </div>

            {error ? <p className="text-sm text-rose-700">{error}</p> : null}

            <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white">
              Uložit recept
            </button>
          </form>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {state.recipes.map((recipe) => (
              <article key={recipe.id} draggable onDragStart={() => setDraggedRecipeId(recipe.id)} className="rounded-xl bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{recipe.name}</h3>
                  <button type="button" onClick={() => deleteRecipe(recipe.id)} className="text-xs text-rose-700">
                    Smazat
                  </button>
                </div>
                <p className="text-xs text-slate-500">Počet v týdnu: {recipeUsage.get(recipe.id) ?? 0}×</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.id}>
                      {ingredient.name}: {ingredient.amount} {ingredient.unit} ({ingredient.section})
                    </li>
                  ))}
                </ul>
              </article>
            ))}
            {state.recipes.length === 0 ? <p className="text-sm text-slate-600">Zatím žádné recepty.</p> : null}
          </div>
        </section>
      ) : null}

      {activeView === "week" ? (
        <section className="rounded-2xl border border-sky-300 bg-sky-50 p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-sky-900">Týdenní tabulka</h2>
          <p className="mb-4 text-sm text-sky-800">Přetáhni recept do buňky. Změna se hned promítne do nákupu.</p>

          <div className="mb-3 grid gap-2 md:grid-cols-3">
            {state.recipes.map((recipe) => (
              <div
                key={`drag-${recipe.id}`}
                draggable
                onDragStart={() => setDraggedRecipeId(recipe.id)}
                className="cursor-grab rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm"
              >
                {recipe.name}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-sky-200 bg-sky-100 p-2 text-left">Den</th>
                  {MEALS.map((meal) => (
                    <th key={meal} className="border border-sky-200 bg-sky-100 p-2 text-left">
                      {mealLabels[meal]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day}>
                    <td className="border border-sky-200 bg-white p-2 font-medium">{day}</td>
                    {MEALS.map((meal) => {
                      const selectedRecipeId = state.weekPlan[day][meal];
                      const selectedRecipeName = state.recipes.find((recipe) => recipe.id === selectedRecipeId)?.name ?? "";
                      return (
                        <td
                          key={`${day}-${meal}`}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (draggedRecipeId) {
                              assignRecipe(day, meal, draggedRecipeId);
                            }
                          }}
                          className="border border-sky-200 bg-white p-2"
                        >
                          <select
                            value={selectedRecipeId ?? ""}
                            onChange={(event) => assignRecipe(day, meal, event.target.value || null)}
                            className="mb-1 w-full rounded border border-slate-300 px-2 py-1"
                          >
                            <option value="">—</option>
                            {state.recipes.map((recipe) => (
                              <option key={recipe.id} value={recipe.id}>
                                {recipe.name}
                              </option>
                            ))}
                          </select>
                          <div className="text-xs text-sky-700">{selectedRecipeName || "Přetáhni recept"}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeView === "shopping" ? (
        <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-emerald-900">Nákupní seznam</h2>
          <p className="mb-4 text-sm text-emerald-800">Automaticky složený z receptů naplánovaných v týdnu.</p>

          <div className="space-y-3">
            {shopping.map((group) => (
              <article key={group.section} className="rounded-lg bg-white p-3">
                <h3 className="mb-2 font-semibold text-emerald-900">{group.section}</h3>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const checked = state.checkedShopping.includes(item.id);
                    return (
                      <li key={item.id}>
                        <label className={`flex items-center gap-2 ${checked ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleShoppingItem(item.id)} />
                          <span>
                            {item.name}: {item.amount} {item.unit}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
            {shopping.length === 0 ? <p className="text-sm text-slate-600">Nákup je zatím prázdný.</p> : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
