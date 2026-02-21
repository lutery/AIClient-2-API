# Repository Guidelines

## Project Structure & Module Organization

- `src/`: application source (Node.js ESM).
  - `src/core/`: master process + plugin manager.
  - `src/services/`: API server/worker entrypoints (HTTP/WebSocket).
  - `src/providers/`: provider adapters and pool manager.
  - `src/converters/`: protocol converters (OpenAI/Claude/Gemini/Ollama/Codex).
  - `src/utils/`, `src/handlers/`, `src/plugins/`: shared utilities, request handlers, plugins.
- `configs/`: runtime configuration (use `*.example` as templates).
- `tests/`: Jest tests (`**/*.test.js`).
- `docker/`: compose files and container deployment assets.
- `static/` + `src/ui-modules/`: Web UI assets/modules (if you touch UI, validate it in a browser).

## Build, Test, and Development Commands

Prereq: Node.js `>= 20` (see `package.json` / `CLAUDE.md`).

- Install deps: `npm ci` (preferred) or `npm install`
- Run (master process): `npm start`
- Run (standalone worker): `npm run start:standalone`
- Dev mode: `npm run start:dev`
- Default ports: `3000` (API/Web UI, unless configured), `3100` (master management)
- Tests: `npm test`
- Coverage: `npm run test:coverage` (outputs `coverage/`)
- Docker (local): `docker build -t aiclient2api .`
- Docker Compose: `cd docker && docker compose up -d`

## Coding Style & Naming Conventions

- JavaScript (ESM): keep `"type": "module"` conventions and include `.js` in relative imports.
- Indentation: 4 spaces; prefer single quotes and semicolons to match existing code.
- Naming: `kebab-case` for config files (e.g., `provider_pools.json.example`), `camelCase` for JS variables, `PascalCase` for classes.

## Testing Guidelines

- Framework: Jest (`jest.config.js`); tests live under `tests/` and end with `.test.js`.
- Prefer `supertest` for API-level tests and keep integration tests deterministic (avoid real credentials).
- If you change request/response conversion or providers, add/adjust an integration test in `tests/`.

## Commit & Pull Request Guidelines

- Commit messages commonly follow Conventional Commits (e.g., `feat(providers): ...`, `fix: ...`), plus occasional `Update VERSION`.
- PRs: describe behavior change, link issues, note config/env changes, and include test output (`npm test`) and screenshots for UI changes.

## Security & Configuration Tips

- Do not commit real tokens/keys. Copy templates from `configs/*.example` and keep secrets in local `configs/` or environment variables (`dotenv` is used).
- Docker deployments should mount configs to `/app/configs` (see `README.md`).
- When editing `configs/`, document new keys in `docs/` or `README.md` if user-facing.
