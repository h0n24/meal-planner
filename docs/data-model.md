# Data model (localStorage)

Aplikace ukládá jeden JSON objekt pod klíčem `meal-planner-v2`:

- `recipes[]`
  - `id`, `name`, `notes`
  - `ingredients[]` (`section`, `name`, `amount`, `unit`)
- `weekPlan`
  - dny v týdnu → `breakfast|lunch|dinner` → `recipeId | null`
- `checkedShopping[]`
  - seznam odškrtnutých položek nákupu

Nákupní seznam se vždy odvozuje z `recipes + weekPlan`.
