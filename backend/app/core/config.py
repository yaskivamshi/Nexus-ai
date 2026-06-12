# backend/app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_ENV: str = "development"
    SECRET_KEY: str = "change_this_to_a_random_32_char_string"

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    OPENROUTER_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""
    NVIDIA_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()