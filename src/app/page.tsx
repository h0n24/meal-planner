"use client";

import { FormEvent, useEffect, useState } from "react";
import { createRecipe, fetchRecipes } from "@/lib/recipe-client";
import type { Recipe } from "@/types/recipe";

const storageMode = process.env.NEXT_PUBLIC_STORAGE_MODE === "client" ? "client" : "postgres";

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const data = await fetchRecipes(storageMode);
      setRecipes(data);
    } catch {
      setError("Nepodařilo se načíst recepty.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Název receptu je povinný.");
      return;
    }

    try {
      await createRecipe(storageMode, {
        name: name.trim(),
        instructions: instructions.trim()
      });
      setName("");
      setInstructions("");
      await load();
    } catch {
      setError("Uložení selhalo.");
    }
  }

  return (
    <main>
      <h1>Meal planner — Vercel ready</h1>
      <p className="muted">
        Režim úložiště: <strong>{storageMode}</strong>. {" "}
        {storageMode === "postgres"
          ? "Data se ukládají přes API do Vercel Postgres."
          : "Data se ukládají jen do localStorage (omezená synchronizace)."}
      </p>

      <section className="card">
        <h2>Nový recept</h2>
        <form onSubmit={onSubmit}>
          <label htmlFor="name">Název</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="instructions">Postup</label>
          <textarea
            id="instructions"
            rows={4}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <button type="submit">Uložit recept</button>
        </form>
        {error ? <p className="muted">{error}</p> : null}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Recepty</h2>
        {recipes.length === 0 ? <p className="muted">Zatím žádné recepty.</p> : null}
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <strong>{recipe.name}</strong>
              {recipe.instructions ? <div className="muted">{recipe.instructions}</div> : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
