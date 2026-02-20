# Vercel deployment + DB návrh

## Proč ne SQLite

Vercel serverless prostředí má ephemeral filesystem, proto SQLite není vhodná pro produkční persistenci.

## Návrh databáze pro free Vercel Postgres

Model je navržený s minimem tabulek a indexů, aby:

- pokryl MVP (katalog, recepty, týdenní plán, nákupní seznam),
- minimalizoval počet dotazů a write operací,
- zvládal free limity připojení.

Viz `prisma/schema.prisma`.

## Fallback strategie (bez serverové synchronizace)

Pokud dojdou limity free plánu:

- přepnout `NEXT_PUBLIC_STORAGE_MODE` na `client`,
- API zápisy se vypnou,
- UI ukládá data do localStorage.

To umožní okamžité pokračování provozu bez další infrastruktury.
