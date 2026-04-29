# AGENTS — News Detection App (quick guide for AI coding agents)

Purpose
- Brief instructions to help AI coding agents be effective in this repository.

Quick start
- Install deps: `npm install` (if no node_modules present).
- Run (development): `npm start` — launches `server.js` on port `3000` (configurable via `PORT`).
- Health: `GET /api/health` responds `{ ok: true }`.

API surface (important endpoints)
- `POST /api/analyze` — JSON body. Typical payloads:
  - Text: `{ "content": "...article text...", "sourceType": "text" }`
  - URL: `{ "url": "https://example.com/article", "sourceType": "url" }`
  - Response: `{ ok: true, result: { ... } }` or `{ ok: false, error: "..." }`

Key files and purpose
- `server.js` — HTTP server, static file serving, API handlers.
- `model.js` — core analysis logic (`analyzeContent`).
- `index.html`, `script.js`, `styles.css` — frontend UI and client code.
- `newsguard_ai/` — domain-specific helper code.
- `logs/` — runtime logs.

Conventions & notes
- Project is Node.js CommonJS (`type: commonjs` in `package.json`).
- Prefer small, focused changes; verify via the `/api/health` and `/api/analyze` endpoints.
- Link to existing docs in repo instead of duplicating them.

Agent checklist (when making changes)
- Run `npm start` and confirm server logs "NewsGuard AI backend running".
- Exercise `POST /api/analyze` with a short example to validate behavior.
- If updating `model.js`, include a brief description of algorithmic intent in the PR.

Where to look for more context
- See `package.json` for scripts and dependencies.
- Inspect `server.js` and `model.js` for input/output shapes and validation rules.

If you'd like, I can also create a `.github/copilot-instructions.md` with recommended agent behaviors for PRs and code reviews.
