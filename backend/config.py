import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # データベースURL（環境変数から取得、なければSQLite）
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./words.db")
    
    # PostgreSQLのURLがpostgres://で始まる場合、postgresql://に変更
    # （RailwayとSQLAlchemyの互換性のため）
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # CORS設定（フロントエンドのURL）
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # 本番環境かどうか
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    @classmethod
    def is_production(cls):
        return cls.ENVIRONMENT == "production"

settings = Settings()

