# Meal Planner (Next.js + localStorage)

Kompletně přepsaná verze bez databáze: vše běží v prohlížeči přes `localStorage`, aby deployment na Vercelu fungoval bez další infrastruktury.

## Hlavní části aplikace

1. **Recepty** (oranžová sekce)
   - vytvoření receptu,
   - zadání surovin (sekce, název, množství, jednotka),
   - recepty jsou draggable do týdenní tabulky.

2. **Nákup** (zelená sekce)
   - automaticky se skládá z receptů z týdenního plánu,
   - položky jsou seskupené podle sekcí (jako v XLSX),
   - položky lze odškrtávat.

3. **Týden** (modrá sekce)
   - tabulka Pondělí–Neděle × Snídaně/Oběd/Večeře,
   - drag & drop receptů,
   - mazání přiřazení a reset celého plánu.

## Spuštění

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Poznámka k synchronizaci

Protože je vše v localStorage, data jsou uložená pouze v konkrétním browseru/zařízení.
