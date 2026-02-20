"use client";

import { FormEvent, useMemo, useState } from "react";
import { deriveShoppingList, DAYS, MEALS, createInitialState } from "@/lib/planner-utils";
import { loadPlannerState, savePlannerState } from "@/lib/local-storage";
import { Ingredient, MealType, PlannerState } from "@/types/meal-planner";

type ViewMode = "recipes" | "shopping" | "week";

const mealLabels: Record<MealType, string> = {
  breakfast: "Snídaně",
  lunch: "Oběd",
  dinner: "Večeře"
};

export default function HomePage() {
  const [view, setView] = useState<ViewMode>("recipes");
  const [state, setState] = useState<PlannerState>(() => loadPlannerState());
  const [recipeName, setRecipeName] = useState("");
  const [recipeNotes, setRecipeNotes] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: crypto.randomUUID(), section: "Ostatní", name: "", amount: 1, unit: "ks" }
  ]);

  const shopping = useMemo(() => deriveShoppingList(state.recipes, state.weekPlan), [state]);

  function updateState(next: PlannerState) {
    setState(next);
    savePlannerState(next);
  }

  function addIngredientRow() {
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), section: "Ostatní", name: "", amount: 1, unit: "ks" }
    ]);
  }

  function onRecipeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recipeName.trim()) {
      return;
    }

    const validIngredients = ingredients
      .filter((item) => item.name.trim())
      .map((item) => ({
        ...item,
        section: item.section.trim() || "Ostatní",
        name: item.name.trim(),
        amount: Number(item.amount) || 1,
        unit: item.unit.trim() || "ks"
      }));

    const next = {
      ...state,
      recipes: [
        {
          id: crypto.randomUUID(),
          name: recipeName.trim(),
          notes: recipeNotes.trim(),
          ingredients: validIngredients
        },
        ...state.recipes
      ]
    };

    updateState(next);
    setRecipeName("");
    setRecipeNotes("");
    setIngredients([{ id: crypto.randomUUID(), section: "Ostatní", name: "", amount: 1, unit: "ks" }]);
  }

  function assignRecipe(day: string, meal: MealType, recipeId: string | null) {
    const next = {
      ...state,
      weekPlan: {
        ...state.weekPlan,
        [day]: {
          ...state.weekPlan[day],
          [meal]: recipeId
        }
      }
    };
    updateState(next);
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-4">
      <header className="mb-4 rounded-2xl bg-white p-4 shadow">
        <h1 className="text-2xl font-bold">Meal Planner (localStorage)</h1>
        <p className="text-sm text-slate-600">3 pohledy podle XLSX: recepty, nákup, týdenní plán s drag & drop.</p>
      </header>

      <nav className="mb-4 grid grid-cols-3 gap-2">
        <button onClick={() => setView("recipes")} className="rounded-xl bg-orange-200 p-3 font-semibold">Recepty</button>
        <button onClick={() => setView("shopping")} className="rounded-xl bg-emerald-200 p-3 font-semibold">Nákup</button>
        <button onClick={() => setView("week")} className="rounded-xl bg-sky-200 p-3 font-semibold">Týden</button>
      </nav>

      {view === "recipes" ? (
        <section className="rounded-2xl bg-orange-50 p-4 shadow">
          <h2 className="mb-3 text-xl font-semibold">Recepty</h2>
          <form onSubmit={onRecipeSubmit} className="space-y-2">
            <input className="w-full rounded border p-2" placeholder="Název receptu" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} />
            <textarea className="w-full rounded border p-2" placeholder="Poznámky / postup" value={recipeNotes} onChange={(e) => setRecipeNotes(e.target.value)} />
            <div className="space-y-2 rounded-xl bg-white p-3">
              <p className="font-medium">Ingredience (sekce + název + množství + jednotka)</p>
              {ingredients.map((item, index) => (
                <div key={item.id} className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <input className="rounded border p-2" placeholder="Sekce" value={item.section} onChange={(e) => setIngredients((prev) => prev.map((it, i) => i === index ? { ...it, section: e.target.value } : it))} />
                  <input className="rounded border p-2" placeholder="Surovina" value={item.name} onChange={(e) => setIngredients((prev) => prev.map((it, i) => i === index ? { ...it, name: e.target.value } : it))} />
                  <input type="number" step="0.1" className="rounded border p-2" placeholder="Množství" value={item.amount} onChange={(e) => setIngredients((prev) => prev.map((it, i) => i === index ? { ...it, amount: Number(e.target.value) } : it))} />
                  <input className="rounded border p-2" placeholder="Jednotka" value={item.unit} onChange={(e) => setIngredients((prev) => prev.map((it, i) => i === index ? { ...it, unit: e.target.value } : it))} />
                </div>
              ))}
              <button type="button" onClick={addIngredientRow} className="rounded bg-slate-200 px-3 py-2">+ přidat surovinu</button>
            </div>
            <button className="rounded bg-orange-500 px-3 py-2 font-semibold text-white" type="submit">Uložit recept</button>
          </form>

          <div className="mt-4 rounded-xl bg-white p-3">
            <h3 className="font-semibold">Seznam receptů (drag do týdne)</h3>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {state.recipes.map((recipe) => (
                <div key={recipe.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/recipe-id", recipe.id)} className="rounded border border-orange-200 bg-orange-100 p-2">
                  <p className="font-medium">{recipe.name}</p>
                  <p className="text-xs text-slate-700">{recipe.ingredients.length} surovin</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {view === "shopping" ? (
        <section className="rounded-2xl bg-emerald-50 p-4 shadow">
          <h2 className="mb-3 text-xl font-semibold">Nákupní seznam (automaticky z týdenního plánu)</h2>
          <div className="space-y-3">
            {shopping.length === 0 ? <p className="text-slate-600">Zatím není co nakoupit. Naplánuj recepty do týdne.</p> : null}
            {shopping.map((group) => (
              <div key={group.section} className="rounded-xl bg-white p-3">
                <h3 className="font-semibold text-emerald-700">{group.section}</h3>
                <ul className="mt-2 space-y-1">
                  {group.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={state.checkedShopping.includes(item.id)}
                        onChange={() => {
                          const checked = state.checkedShopping.includes(item.id);
                          const next = {
                            ...state,
                            checkedShopping: checked
                              ? state.checkedShopping.filter((id) => id !== item.id)
                              : [...state.checkedShopping, item.id]
                          };
                          updateState(next);
                        }}
                      />
                      <span className={state.checkedShopping.includes(item.id) ? "text-slate-400 line-through" : "text-slate-800"}>
                        {item.name} — {item.amount} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "week" ? (
        <section className="rounded-2xl bg-sky-50 p-4 shadow">
          <h2 className="mb-3 text-xl font-semibold">Týdenní tabulka (drag & drop receptů)</h2>
          <div className="overflow-x-auto rounded-xl bg-white p-3">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Den</th>
                  {MEALS.map((meal) => (
                    <th key={meal} className="border p-2 text-left">{mealLabels[meal]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day}>
                    <td className="border p-2 font-medium">{day}</td>
                    {MEALS.map((meal) => {
                      const recipeId = state.weekPlan[day]?.[meal] ?? null;
                      const recipe = state.recipes.find((item) => item.id === recipeId);
                      return (
                        <td
                          key={`${day}-${meal}`}
                          className="h-20 border p-2 align-top"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const id = e.dataTransfer.getData("text/recipe-id");
                            if (id) {
                              assignRecipe(day, meal, id);
                            }
                          }}
                        >
                          <div className="flex min-h-14 flex-col justify-between rounded bg-sky-100 p-2">
                            <span className="text-sm">{recipe ? recipe.name : "Přetáhni recept"}</span>
                            {recipe ? (
                              <button
                                type="button"
                                className="mt-2 rounded bg-white px-2 py-1 text-xs"
                                onClick={() => assignRecipe(day, meal, null)}
                              >
                                Vymazat
                              </button>
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-3 rounded bg-slate-700 px-3 py-2 text-white" onClick={() => updateState(createInitialState())}>Reset všeho</button>
        </section>
      ) : null}
    </main>
  );
}
