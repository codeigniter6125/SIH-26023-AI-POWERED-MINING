# Agents

Two meanings, two sections: the **AI agents inside GeoMine**, and **rules for coding agents** (Claude Code, Copilot…)
working in this repo.

## 1. GeoMine's multi-agent engine (`agents/`)

```
user question ──► RouterAgent ──► CoreGeologicalAgent ──► ValidationAgent ──► answer + citations
                  (intent)        (SQL facts, calculators,   (physical checks,
                                   Gemini wording)            citation check)
```
`agents/orchestrator.py → MultiAgentOrchestrator.handle_query(query, filters)` runs the chain. Each step has a
fallback, so one failure never produces a made-up answer; it produces an honest lower-confidence or failed result.

### RouterAgent — `agents/router/router_agent.py`
Classifies intent: `PQ_FAST_RESPONSE`, `DISCREPANCY_ANALYSIS`, `RESERVE_ESTIMATION`, `STATUTORY_AUDIT`, `GENERAL_QUERY`.
Today it uses keyword rules. **Planned:** Gemini classification with the keyword rules as fallback.

### CoreGeologicalAgent — `agents/core/core_agent.py`
- Reads boreholes from the DB and computes statistics.
- Uses deterministic formulas in `agents/core/mining_calculators.py` (reserve tonnage = area × thickness × density, unit conversions).
  Numbers come from code, never from the LLM.
- Calls Gemini (`google-genai`, model from config) only to word the answer. Without `GEMINI_API_KEY` it returns
  the structured answer without LLM wording.
- Attaches citations from `fact_evidence_citations`.

### ValidationAgent — `agents/validation/validation_agent.py`
Checks physical limits (thickness > 0, ash 0–100 %, depth order), checks every number has a citation, and sets
`confidence_score` and `is_verified`.

### Planned agents

| Agent | Job | FR |
|---|---|---|
| RetrievalAgent | Vector search over `document_chunks`, merged with SQL hits | FR-14 |
| ConflictScout | Background job: compare the same seam across agencies, open `discrepancies` rows | FR-5, FR-8 |
| TopicAgent | Keywords and topics per document for the word cloud | FR-2 |
| ReportWriter | Formal PQ format (Lok Sabha / Rajya Sabha) with numbered citations | FR-9 |

### Rules every agent follows
1. Numbers come from SQL or calculators. The LLM never invents a number.
2. No citation, no fact. Uncited claims are dropped or marked unverified.
3. Failures are reported as failures.
4. Agents are pure Python and testable without network access.

## 2. Rules for coding agents in this repo

- Read `docs/architecture.md` first. Keep the folder layout.
- Python: 3.11+, `ruff`, type hints. TypeScript: strict mode, no `any` in new code.
- Never commit `.env`, `*.db`, `uploads/`, or API keys.
- Never add fake fallback data to make a demo pass. Show an empty or error state instead.
- Keep Pydantic schemas and `frontend/src/types/geological.ts` in step when you change a contract.
- `web/` copy lives in `web/src/config/copy.ts`; tokens live in `web/src/styles/tokens.css`. No hard-coded colours in components.
- Run `pytest` in `backend/` and `npm run build && npm test` in `web/` before you say a change works.
