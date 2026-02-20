# Repository Guidelines

This repository contains the initial Vite + React + Tailwind scaffold. The conventions below define the structure and contribution standards; update them if tooling or layout changes.

## Project Structure & Module Organization
- `src/` for production code, grouped by feature (e.g., `src/search/`, `src/ui/`).
- `tests/` for unit/integration tests mirroring `src/` (e.g., `tests/search/`).
- `assets/` for static files such as images, fixtures, or sample data.
- `scripts/` for developer tooling (e.g., `scripts/seed-data.ps1`).
- `docs/` for architecture notes, decisions, and contributor documentation.
- `config/` for non-secret configuration files.

## Build, Test, and Development Commands
- `npm run dev`: run the app locally (Vite dev server).
- `npm run build`: create a production build.
- `npm run preview`: preview the production build locally.
- `npm run test`: placeholder (no tests configured yet).
- `npm run lint`: placeholder (no lint configured yet).

## Coding Style & Naming Conventions
- Use spaces, not tabs; default to 2-space indentation unless the chosen language's standard dictates otherwise.
- Prefer `kebab-case` for directories and files, `camelCase` for variables/functions, and `PascalCase` for types/classes.
- Keep modules small and focused; avoid cross-feature imports unless explicitly shared.

## Testing Guidelines
- Place tests under `tests/` and keep a 1:1 mapping with `src/` paths.
- Name tests as `<module>.test.<ext>` (example: `search.test.ts`).
- Add regression tests with bug fixes; prioritize core flows and data integrity.

## Commit & Pull Request Guidelines
Use Conventional Commits until project rules are defined (e.g., `feat: add search index`, `fix: handle empty input`). PRs should include a concise summary, testing evidence (command + result), and screenshots for UI changes.

## Security & Configuration Tips
Never commit secrets. Use a `.env.example` for required keys and keep local `.env` files ignored.