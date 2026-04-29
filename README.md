# News Detection App

Small local project that analyzes news-like text for factual/quality signals.

## Tests

- Location: `tests/test_analyze.js` — a small Node.js script that sends HTTP POST requests to `/api/analyze`.
- Scenarios included: real news, fake-news style content, informational content, and an edge case (empty input).

How to run the tests

1. Install dependencies:

```bash
npm install
```

2. Start the server (in one terminal):

```bash
npm start
```

3. Run the API tests (in another terminal):

```bash
npm run test:api
```

Notes

- The test script expects the server to be reachable at `localhost` on the port specified by the `PORT` environment variable (default `3000`).
- The test script exits with code `0` on success and non-zero on failure; check output for failing case details.
