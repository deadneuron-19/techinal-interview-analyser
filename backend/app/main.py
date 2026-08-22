from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.errors import general_exception_handler

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Backend API for the Technical Interview Reasoning Analyzer.",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_exception_handler(
    Exception,
    general_exception_handler,
)


app.include_router(api_router)
