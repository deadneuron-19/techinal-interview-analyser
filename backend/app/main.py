from fastapi import FastAPI

app = FastAPI(
    title="Technical Interview Reasoning Analyzer",
    description="Backend API for analyzing technical interview reasoning.",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "Technical Interview Reasoning Analyzer API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }