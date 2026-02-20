import test from 'node:test';
import assert from 'node:assert/strict';

function deriveShoppingList(recipes, weekPlan) {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const grouped = {};
  const days = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
  const meals = ['breakfast', 'lunch', 'dinner'];

  for (const day of days) {
    for (const meal of meals) {
      const recipeId = weekPlan[day]?.[meal];
      if (!recipeId || !recipeMap.has(recipeId)) continue;
      const recipe = recipeMap.get(recipeId);
      for (const ingredient of recipe.ingredients) {
        const section = ingredient.section || 'Ostatní';
        const key = `${ingredient.name}|${ingredient.unit}`;
        grouped[section] ??= {};
        grouped[section][key] = (grouped[section][key] ?? 0) + ingredient.amount;
      }
    }
  }

  return grouped;
}

test('aggregates ingredient amounts from planned recipes', () => {
  const recipes = [
    {
      id: 'r1',
      ingredients: [
        { section: 'Pečivo', name: 'tortilla', amount: 2, unit: 'ks' },
        { section: 'Maso', name: 'kuře', amount: 300, unit: 'g' }
      ]
    }
  ];

  const weekPlan = {
    Pondělí: { breakfast: null, lunch: 'r1', dinner: 'r1' },
    Úterý: { breakfast: null, lunch: null, dinner: null },
    Středa: { breakfast: null, lunch: null, dinner: null },
    Čtvrtek: { breakfast: null, lunch: null, dinner: null },
    Pátek: { breakfast: null, lunch: null, dinner: null },
    Sobota: { breakfast: null, lunch: null, dinner: null },
    Neděle: { breakfast: null, lunch: null, dinner: null }
  };

  const grouped = deriveShoppingList(recipes, weekPlan);
  assert.equal(grouped.Pečivo['tortilla|ks'], 4);
  assert.equal(grouped.Maso['kuře|g'], 600);
});
