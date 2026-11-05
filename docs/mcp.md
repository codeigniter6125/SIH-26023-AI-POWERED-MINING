# MCP (Model Context Protocol)

**Status: planned.** Two uses.

## 1. GeoMine as an MCP server

Expose GeoMine's read tools so any MCP client (Claude Desktop, Claude Code, an internal Ministry assistant) can ask
cited questions without scraping the UI. Same rules as the API: numbers from SQL, citations on everything.

Location: `mcp/server.py` (new), Python `mcp` SDK, stdio transport for local use, streamable HTTP for deploys.
It calls the FastAPI service over HTTP, so auth and rate limits stay in one place.

| Tool | Input | Calls | Returns |
|---|---|---|---|
| `search_boreholes` | coalfield?, block?, minThickness?, maxAsh?, grade? | `GET /boreholes/` | list of boreholes |
| `get_borehole` | boreholeId | `GET /boreholes/{id}` | dossier with intervals and citations |
| `ask_geomine` | question | `POST /query/` | answer, confidence, citations, routing path |
| `list_discrepancies` | status? | `GET /discrepancies/` | queue items |
| `generate_report` | mode, coalfield, block, questionTitle? | `POST /reports/generate` | report + hash |

Resources: `geomine://borehole/{id}`, `geomine://document/{id}/page/{n}`.
Write tools (approve, upload) are **not** exposed over MCP until auth exists, and then only with a user token.

Sketch:
```python
from mcp.server.fastmcp import FastMCP
import httpx, os
API = os.environ.get("GEOMINE_API", "http://localhost:8000/api/v1")
mcp = FastMCP("geomine")

@mcp.tool()
async def ask_geomine(question: str) -> dict:
    """Ask a cited question about CMPDI borehole and seam records."""
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(f"{API}/query/", json={"query": question})
        r.raise_for_status()
        return r.json()

if __name__ == "__main__":
    mcp.run()
```

Claude Code config (`.mcp.json` at repo root):
```json
{ "mcpServers": { "geomine": { "command": "python", "args": ["mcp/server.py"],
                                "env": { "GEOMINE_API": "http://localhost:8000/api/v1" } } } }
```

## 2. MCP servers the team uses while building

| Server | Use |
|---|---|
| Supabase MCP | Inspect the Postgres schema, run migrations on a branch DB, read logs |
| Browser (Playwright / built-in) | Check `web/` and `frontend/` pages, read console errors |
| GitHub | PRs and issues |

Never give an MCP server production write credentials during the hackathon.
