from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.services.demo_seed import seed_demo_data_if_empty
from app.api.routes.api_v1 import router as api_v1_router
from app.api.routes.reliability import router as reliability_router

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Seed demo data if database is brand new
with SessionLocal() as db:
    seed_demo_data_if_empty(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Reliabench: AI Agent Benchmarking & Reliability Platform (Global AI Hackathon | PS02)",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)
app.include_router(reliability_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Same tasks. Same conditions. Measurable agent reliability.",
        "status": "operational",
        "api_docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health"
    }

