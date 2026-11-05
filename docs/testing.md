# Testing

## What exists

| Suite | Path | Run |
|---|---|---|
| API tests (pytest + TestClient) | `backend/tests/test_api.py` | `cd backend && pytest` |
| DB tests | `backend/tests/test_database.py` | same |
| 3D world unit tests (vitest) | `web/src/**/*.test.ts` | `cd web && npm test` |
| 3D world type check + build | — | `cd web && npm run build` |

## What to add

| Area | Test | Why |
|---|---|---|
| agents | Router intent table test; calculator unit tests; "no citation, no fact" test | Numbers must be deterministic |
| ingestion | Golden test with `uploads/BH_NK_094_Scanned_Litholog.png` → expected intervals | Catch OCR regressions |
| backend | Auth: 401 without token, 403 with wrong role, 200 with right role | Once auth lands |
| backend | PQ mode finishes under 45 s with LLM mocked | PRD target |
| frontend | Playwright smoke: dashboard loads, approve flow, report generate | Demo path |
| web | Playwright: page loads, no console errors, query box shows result or honest error, flat mode with `?flat=1` | Demo path |
| a11y | axe-core on `web/` and `frontend/` | WCAG 2.1 AA |

## Rules
- Tests never call real Gemini or Vision. Mock at the client boundary.
- Tests use a temp SQLite DB (`DATABASE_URL=sqlite:///./test.db`), seeded in a fixture.
- A test that passes because of fallback data is a broken test.

## CI (to add): `.github/workflows/ci.yml`

```yaml
name: ci
on: [pull_request, push]
jobs:
  web:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: web } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: web/package-lock.json }
      - run: npm ci
      - run: npm run build
      - run: npm test
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r backend/requirements.txt -r agents/requirements.txt -r ingestion/requirements.txt pytest ruff
      - run: ruff check backend agents ingestion
      - run: cd backend && pytest -q
```

## Manual demo checklist
- [ ] `web/`: loader builds the strata, scroll reaches Core shed, no console errors
- [ ] Ask "What is the verified thickness of Seam IX at NK-094?" → answer with citations
- [ ] Stop the backend → the query box says it can't reach the API (no fake answer)
- [ ] Night mode, sound toggle, flat mode toggle all work
- [ ] Keyboard only: Tab reaches every button, chip and the query box, focus ring visible
- [ ] Phone width (375 px): no sideways scroll, simpler camera
