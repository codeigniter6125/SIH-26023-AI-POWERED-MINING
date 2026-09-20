from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="CMPDI Geological Intelligence & Exploration Records Portal (SIH26023)",
    version="2.1.0"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for development across ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "CMPDI Geological Intelligence Backend",
        "version": "2.1.0",
        "compliance": "GIGW 3.0 & NIC Compliant API Standard"
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to CMPDI Geological Intelligence & Exploration Records Portal API (SIH26023)",
        "docs": "/docs",
        "endpoints": {
            "boreholes": f"{settings.API_V1_STR}/boreholes",
            "discrepancies": f"{settings.API_V1_STR}/discrepancies",
            "reports": f"{settings.API_V1_STR}/reports",
            "query": f"{settings.API_V1_STR}/query",
            "ingestion": f"{settings.API_V1_STR}/ingestion"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
