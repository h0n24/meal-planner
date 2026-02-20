# Meal Planner PWA — Codex Starter Task

## Goal

Build an **installable, mobile-first web app (PWA)** that helps a user plan meals for a week and automatically generates a **sectioned shopping list**.

The app should feel like a native mobile app: fast navigation, touch-friendly UI, and an “app-like” shell. A PWA achieves this by using a **Web App Manifest** and (optionally) a **service worker** to cache the app shell for offline-ish behavior. citeturn0search0turn0search1turn0search20

---

## Scope (MVP)

### Core entities
1. **Grocery Catalog**
   - Maintain an updatable list of grocery items (e.g., eggs, potatoes, pork chops).
   - Organize items into **sections/categories** (e.g., Bakery, Produce, Frozen).

2. **Recipes (CRUD)**
   - Create / edit / delete recipes.
   - Each recipe contains:
     - **Ingredients list** (ingredient + amount + optional unit)
     - **Step-by-step instructions** (rich text not required; multiline text is OK)
     - **Meal photo** (MVP: store image as URL; optional file upload as stretch)

3. **Weekly Meal Plan**
   - Select recipes for **breakfast / lunch / dinner** for each day of the next week.

4. **Shopping List (Generated)**
   - Generate a consolidated list of ingredients needed for the selected week.
   - Group items by the same **sections** used in the Grocery Catalog.
   - Support **checking off** items; checked items become **grayed out**.

---

## Non-goals (for MVP)

- Multi-user accounts / authentication
- Nutrition macros, calorie counts
- Pantry inventory / leftovers logic
- Social sharing, import/export, barcode scanning

---

## Recommended tech stack (state-of-the-art, pragmatic)

- **Next.js (App Router) + TypeScript**
- **SQLite (dev) + Prisma ORM** (easy relational modeling, migrations). citeturn0search12turn0search19
- **Tailwind CSS** (mobile-first styling)
- **React Hook Form + Zod** (forms + validation)
- **Playwright** (E2E) + **Vitest** (unit tests)

> If you prefer a pure local-first approach (no backend), swap Prisma/SQLite for IndexedDB. MVP below assumes a small DB-backed app.

---

## Information architecture (pages / routes)

- `/groceries`
  - Manage grocery **sections** and **items**
- `/recipes`
  - List recipes + actions
- `/recipes/new`
- `/recipes/[id]`
  - View/edit recipe
- `/plan`
  - Week grid; pick recipes per day + meal type
- `/shopping-list`
  - Generated list, grouped by section, checkable

Mobile UX suggestion: bottom navigation with 4 tabs (Groceries / Recipes / Plan / List).

---

## Data model

### Tables (minimum)

- `GrocerySection`
  - `id`, `name`, `sortOrder`
- `GroceryItem`
  - `id`, `name`, `sectionId`, `isArchived`
- `Recipe`
  - `id`, `name`, `description`, `instructions`, `imageUrl`, `updatedAt`
- `RecipeIngredient`
  - `id`, `recipeId`, `groceryItemId`, `amount`, `unit` (nullable)
- `WeekPlan`
  - `id`, `weekStartDate` (ISO date, e.g., Monday)
- `WeekPlanEntry`
  - `id`, `weekPlanId`, `date` (ISO date), `mealType` (`BREAKFAST|LUNCH|DINNER`), `recipeId`

### Shopping list (derived)
- Computed from all selected recipes for the week.
- Aggregate by `groceryItemId` and `unit` (if units match), sum amounts.
- Persist “checked” state per `weekPlanId` + `groceryItemId` (+ `unit` if needed).

---

## Functional requirements

### 1) Grocery Catalog

**Create / Edit / Delete**
- Add/edit/remove sections
- Add/edit/remove items in sections
- Prevent duplicate item names (case-insensitive) within the whole catalog

**Acceptance criteria**
- Items render under their section header.
- Sections are ordered by `sortOrder`.
- Items can be archived (hidden from pickers but not deleted).

### 2) Recipes

**Recipe form**
- Name (required)
- Instructions (multiline)
- Image (MVP: URL input + preview)

**Ingredients editor**
- Each ingredient row:
  - Grocery item selector: **input that only allows values from GroceryItem list**
    - Implement as an **autocomplete / combobox** that rejects unknown strings on submit.
  - Amount (number; allow decimals)
  - Unit (string; optional)

**Acceptance criteria**
- It is impossible to save a recipe with an ingredient that does not exist in Grocery Catalog.
- Users can add/remove ingredient rows.
- Editing a recipe updates timestamps.

### 3) Weekly Meal Plan

**Week view**
- Select the “next week” (default: upcoming Monday–Sunday).
- Grid: rows = days, columns = Breakfast/Lunch/Dinner.
- Each cell lets user choose a recipe (or empty).

**Acceptance criteria**
- Saving persists the plan; reloading restores selections.
- Changing a recipe in the plan updates the generated shopping list.

### 4) Shopping list generation

**Rules**
- Collect ingredients from all recipes in the selected week plan.
- Group by section:
  - `GroceryItem.sectionId`
- For each grocery item:
  - Aggregate amounts when `unit` matches.
  - If units differ or are missing, show multiple lines (e.g., “Milk: 1 l” and “Milk: 500 ml”).

**UI**
- Grouped list: Section header → items
- Each item has a checkbox.
- Checked items appear muted/gray (and optionally move to bottom within section).

**Accessibility**
- If you implement custom checkbox UI, follow ARIA checkbox guidance (role, `aria-checked`, keyboard support). citeturn0search2turn0search11

**Acceptance criteria**
- Items are grouped exactly like the grocery catalog sections.
- Toggling an item persists (refresh keeps checked state).
- Checked items are visually distinct (gray) and still readable.

---

## PWA requirements (mobile-app feel)

**Minimum**
- Add `manifest.webmanifest` with name, icons, start_url, display mode.
- Ensure HTTPS in production (required for service workers).
- Responsive layout with safe-area support.

**Recommended**
- Add a service worker to cache the app shell so the UI loads when offline and data reads are resilient. citeturn0search13turn0search0

---

## Testing requirements

1. **Unit tests** for:
   - Shopping list aggregation logic
   - Week start date calculation
2. **E2E tests** (Playwright) for:
   - Create grocery section + item
   - Create recipe with allowed ingredient
   - Plan week meals
   - Generate list and check items

---

## Deliverables (what Codex should produce)

1. A Next.js + TypeScript project with:
   - Routes listed above
   - Prisma schema + migrations + seed script
2. UI that is mobile-first:
   - Bottom navigation
   - Forms with validation + inline errors
3. Shopping list generator (pure function) + tests
4. PWA manifest (and service worker if feasible in MVP)
5. README with:
   - Setup steps
   - DB migration commands
   - Test commands
   - Short architecture notes

---

## Stretch goals (nice-to-have)

- Drag & drop reorder for sections/items
- Photo upload to object storage (S3/R2) instead of URL
- “Pantry mode”: exclude items already at home
- Export list (plain text) / share sheet on mobile
- Offline-first sync (IndexedDB + background sync)

---

## References

- PWA installability and manifest concepts (MDN + W3C). citeturn0search0turn0search1turn0search20
- Accessible checkbox behavior (WAI APG, MDN ARIA reference). citeturn0search2turn0search11
- Prisma relations modeling. citeturn0search12turn0search19
