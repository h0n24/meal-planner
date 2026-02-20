# Meal planner (Vercel-ready)

Tato verze je připravená pro deployment na Vercel s fallbackem na čistě client-side režim, pokud free limity Vercel Postgres nestačí.

## Režimy ukládání

- `NEXT_PUBLIC_STORAGE_MODE=postgres` + `DATABASE_URL` → používá Vercel Postgres přes Prisma.
- `NEXT_PUBLIC_STORAGE_MODE=client` → ukládá recepty jen do `localStorage` (omezená synchronizace mezi zařízeními).

## Spuštění lokálně

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Prisma migrace pro Vercel

Na produkci používej deploy migrace:

```bash
npm run prisma:migrate:deploy
```

## Doporučená konfigurace ve Vercelu

1. Import projektu z Git repa.
2. Nastav Environment Variables:
   - `NEXT_PUBLIC_STORAGE_MODE=postgres`
   - `DATABASE_URL=<Vercel Postgres connection string>`
3. Build command: `npm run build`
4. (Volitelně) před deployem spusť `npm run prisma:migrate:deploy` v CI.

## Omezení free Vercel Postgres

Pokud narazíš na limity free tarifu (storage/compute/connections), přepni produkci na:

- `NEXT_PUBLIC_STORAGE_MODE=client`

Aplikace zůstane funkční, ale data budou pouze per-browser/per-device.

## Původní podklady a dokumentace

Původní zdrojové podklady jsou přesunuty do složky `Docs/`, aby se neztratily:

- `Docs/meal-planner-codex-starter.md`
- `Docs/Shopping%20list.xlsx`
- `Docs/meal%20perp.xlsx`
