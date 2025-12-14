"""
単語帳設定機能追加のためのデータベースマイグレーションスクリプト
既存のnotebooksテーブルにsettingsカラムを追加します。
"""
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
import json

SQLALCHEMY_DATABASE_URL = "sqlite:///./words.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_column_if_not_exists(engine, table_name, column_name, column_type, default_value=None, nullable=True):
    """テーブルにカラムが存在しない場合に追加"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    
    if column_name not in columns:
        with engine.connect() as connection:
            with connection.begin():
                # SQLiteではJSON型を直接サポートしていないため、TEXT型として保存
                alter_sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} TEXT"
                connection.execute(text(alter_sql))
                print(f"✓ {table_name}テーブルに{column_name}カラムを追加しました")
                
                # 既存のレコードにデフォルト値を設定
                default_json = json.dumps(default_value) if default_value else '{}'
                update_sql = f"UPDATE {table_name} SET {column_name} = '{default_json}' WHERE {column_name} IS NULL"
                connection.execute(text(update_sql))
                print(f"✓ 既存のレコードにデフォルト設定を適用しました")
            return True
    else:
        print(f"  {table_name}テーブルの{column_name}カラムは既に存在します")
        return False

if __name__ == "__main__":
    print("データベースマイグレーションを開始します...")
    print()
    
    default_settings = {
        "exclude_mastered": False,
        "default_direction": "word-to-meaning",
        "default_order": "sequential",
        "card_colors": {
            "front": "blue",
            "back": "light-blue"
        }
    }
    
    # notebooksテーブルにsettingsカラムを追加
    add_column_if_not_exists(engine, "notebooks", "settings", "TEXT", default_settings)
    
    print()
    print("マイグレーションが完了しました！")

