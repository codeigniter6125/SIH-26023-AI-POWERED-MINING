# Auth

**Status: not built.** Today every request is anonymous and audit events use a fixed demo actor (`EMP-RI2-8492`).
This is the plan.

## Choice
Firebase Authentication (per [techstack.md](techstack.md)): email/password for the demo, Google/NIC SSO later.
Roles are Firebase **custom claims**, so the backend can authorize without a DB lookup.

## Roles

| Role claim | Persona | Can |
|---|---|---|
| `GEOLOGIST` | CMPDI field / chief geologist | Read all, upload documents, approve seam thickness |
| `DESK_OFFICER` | Ministry desk / parliamentary officer | Read all, generate reports and PQ answers |
| `REVIEWER` | Joint technical committee | Read all, approve or reject discrepancies |
| `DGMS_AUDITOR` | DGMS auditor | Read all, export Form-V / DGMS dockets, read audit trail |
| `ADMIN` | Platform admin | Set roles |

Anonymous visitors (the 3D world) may call read-only demo endpoints: `GET /boreholes`, `GET /discrepancies`, `POST /query`
(rate-limited). Everything that writes needs a role.

## Flow

```
Browser ──signIn──► Firebase Auth ──ID token (JWT, 1h)──► Browser
Browser ──Authorization: Bearer <token>──► FastAPI
FastAPI ── firebase_admin.auth.verify_id_token() ──► uid, email, role claim
FastAPI ── require_role("REVIEWER") dependency ──► handler ──► audit_events.actor_id = uid
```

## Backend sketch

```python
# backend/app/core/auth.py
from fastapi import Depends, Header, HTTPException
from firebase_admin import auth as fb_auth

def current_officer(authorization: str = Header(None)):
    if settings.AUTH_MODE == "dev":           # local only
        return {"uid": "dev", "role": "ADMIN"}
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Sign in required")
    claims = fb_auth.verify_id_token(authorization.removeprefix("Bearer "))
    return {"uid": claims["uid"], "role": claims.get("role")}

def require_role(*roles):
    def dep(officer=Depends(current_officer)):
        if officer["role"] not in roles:
            raise HTTPException(403, "Your role cannot do this")
        return officer
    return dep
```

## Environment

| Var | Where | Notes |
|---|---|---|
| `AUTH_MODE` | backend | `firebase` (default) or `dev`. `dev` must never be set in deploys. |
| `FIREBASE_PROJECT_ID` | backend | |
| `GOOGLE_APPLICATION_CREDENTIALS` | backend | Service account JSON path, never committed |
| `NEXT_PUBLIC_FIREBASE_*` / `VITE_FIREBASE_*` | frontends | Public web config |

## The 3D world's "Pick your hard hat" stop
Each hat links to the workspace with the role as a hint: `frontend /login?role=GEOLOGIST`. The hint only pre-selects
the form. The real role always comes from the token claim.

## Security notes
- CORS is an allow-list (`BACKEND_CORS_ORIGINS`). Add the deployed web and workspace origins only.
- Rate-limit `POST /query` and `POST /ingestion/upload` per IP for anonymous use.
- Upload limits: 25 MB, PDF/PNG/JPG/TIFF/XLSX/CSV/LAS only, checked by content type and extension.
