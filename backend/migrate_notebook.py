"""
単語帳機能追加のためのデータベースマイグレーションスクリプト
既存のデータベースにnotebooksテーブルを追加し、wordsテーブルにnotebook_idカラムを追加します。
"""
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime

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
                nullable_str = "NULL" if nullable else "NOT NULL"
                default_str = ""
                
                if default_value is not None:
                    if isinstance(default_value, bool):
                        default_str = f" DEFAULT {1 if default_value else 0}"
                    elif isinstance(default_value, int):
                        default_str = f" DEFAULT {default_value}"
                    elif isinstance(default_value, str):
                        default_str = f" DEFAULT '{default_value}'"
                
                if not nullable and default_value is None:
                    nullable_str = "NOT NULL"
                
                alter_sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}{default_str} {nullable_str}"
                connection.execute(text(alter_sql))
                print(f"✓ {table_name}テーブルに{column_name}カラムを追加しました")
        return True
    else:
        print(f"  {table_name}テーブルの{column_name}カラムは既に存在します")
        return False

def create_notebooks_table(engine):
    """notebooksテーブルを作成"""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    if "notebooks" not in tables:
        with engine.connect() as connection:
            with connection.begin():
                create_table_sql = """
                CREATE TABLE notebooks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
                """
                connection.execute(text(create_table_sql))
                print("✓ notebooksテーブルを作成しました")
                
                # デフォルトの単語帳を作成
                insert_sql = """
                INSERT INTO notebooks (name, created_at) 
                VALUES ('デフォルト', CURRENT_TIMESTAMP)
                """
                connection.execute(text(insert_sql))
                print("✓ デフォルト単語帳を作成しました")
        return True
    else:
        print("  notebooksテーブルは既に存在します")
        return False

if __name__ == "__main__":
    print("データベースマイグレーションを開始します...")
    print()
    
    # notebooksテーブルを作成
    create_notebooks_table(engine)
    
    # デフォルト単語帳のIDを取得（存在しない場合は作成）
    with engine.connect() as connection:
        with connection.begin():
            result = connection.execute(text("SELECT id FROM notebooks LIMIT 1"))
            default_notebook_id = result.scalar()
            if default_notebook_id is None:
                # デフォルト単語帳を作成
                connection.execute(text("""
                    INSERT INTO notebooks (name, created_at) 
                    VALUES ('デフォルト', CURRENT_TIMESTAMP)
                """))
                default_notebook_id = connection.execute(text("SELECT last_insert_rowid()")).scalar()
                print(f"✓ デフォルト単語帳を作成しました（ID: {default_notebook_id}）")
            else:
                print(f"✓ 既存のデフォルト単語帳を使用します（ID: {default_notebook_id}）")
    
    # wordsテーブルにnotebook_idカラムを追加（デフォルト値付き）
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns("words")]
    
    if "notebook_id" not in columns:
        with engine.connect() as connection:
            with connection.begin():
                # まずNULL許可でカラムを追加
                connection.execute(text(f"""
                    ALTER TABLE words ADD COLUMN notebook_id INTEGER DEFAULT {default_notebook_id}
                """))
                print("✓ wordsテーブルにnotebook_idカラムを追加しました")
                
                # 既存の単語にデフォルト単語帳IDを設定
                connection.execute(text(f"""
                    UPDATE words SET notebook_id = {default_notebook_id} WHERE notebook_id IS NULL
                """))
                print(f"✓ 既存の単語をデフォルト単語帳（ID: {default_notebook_id}）に関連付けました")
                
                # NOT NULL制約を追加（SQLiteでは直接できないので、新しいテーブルを作成してデータを移行）
                # ただし、これは複雑なので、アプリケーション側でNOT NULLを強制する
                print("  ※ notebook_idカラムはNULL許可のままですが、アプリケーション側でNOT NULLとして扱います")
    else:
        print("  wordsテーブルのnotebook_idカラムは既に存在します")
    
    # notebook_idにインデックスを追加（存在しない場合）
    inspector = inspect(engine)
    indexes = [idx['name'] for idx in inspector.get_indexes("words")]
    if "ix_words_notebook_id" not in indexes:
        with engine.connect() as connection:
            with connection.begin():
                connection.execute(text("CREATE INDEX ix_words_notebook_id ON words(notebook_id)"))
                print("✓ notebook_idカラムにインデックスを追加しました")
    
    print()
    print("マイグレーションが完了しました！")

