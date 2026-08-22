from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Technical Interview Reasoning Analyzer"
    environment: str = "development"

    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"

    database_url: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/interview_analyser"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
