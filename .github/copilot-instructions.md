# Copilot instructions — News Detection App

Purpose
- Help AI coding agents and contributors make small, safe, high-value changes quickly.

Quick start
- Install deps: `npm install`
- Run locally: `npm start` (server logs: "NewsGuard AI backend running on http://localhost:3000").
- Health check: `GET /api/health` → `{ ok: true }`.

Verify changes
- When modifying code, run the server and exercise `POST /api/analyze` with a short example.
- Example curl (text):

```bash
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"content":"This is a short news-like paragraph for testing.","sourceType":"text"}'
```

Editing guidance
- Keep changes small and focused. Document behavioral intent in PR descriptions.
- If editing `model.js`, include a short note describing the algorithmic change and why it improves results.
- Prefer minimal, non-breaking changes to `server.js` — preserve public API shape and error codes.

Pull request checklist
- Describe what you changed and why (2–4 sentences).
- Include how you validated the change (commands, sample requests, logs).
- If the change affects analysis behavior, include sample inputs and outputs.

Agent behavior notes
- Use [AGENTS.md](AGENTS.md) as the canonical agent guide for run/dev commands and API shapes.
- Link to existing docs instead of copying large text.
- Run the server locally before claiming a backend fix is complete.

When to request a new skill or agent
- Create a new skill when a task is repeated (e.g., automated API tests, data collection, or model evaluation). Describe inputs/outputs and required permissions.

If unsure
- Open an issue or PR describing the requested change and include a reproducible example.
