from pathlib import Path
import os

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


class Settings:
    default_sqlite_path = Path(os.getenv("LOCALAPPDATA", str(BASE_DIR))) / "FoodWebsite" / "food_app.db"
    database_path = os.getenv("DATABASE_PATH", "").strip()
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_path:
        database_url = f"sqlite:///{Path(database_path).expanduser().resolve().as_posix()}"
    elif not database_url:
        database_url = f"sqlite:///{default_sqlite_path.as_posix()}"
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    elif database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)

    app_name = "Food Website API"
    secret_key = os.getenv("SECRET_KEY", "change-this-secret-key")
    jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "4320"))
    frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:5173")
    payment_provider = os.getenv("PAYMENT_PROVIDER", "demo").lower()
    stripe_secret_key = os.getenv("STRIPE_SECRET_KEY", "")
    stripe_publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    currency = os.getenv("CURRENCY", "usd")
    delivery_fee = int(os.getenv("DELIVERY_FEE", "2"))
    allowed_origins = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
