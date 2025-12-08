"""
データベースマイグレーションスクリプト
既存のデータベースに新しいカラムを追加します
"""
import sqlite3
import os

DB_PATH = "words.db"

if os.path.exists(DB_PATH):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 新しいカラムが存在するか確認
        cursor.execute("PRAGMA table_info(words)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'correct_count' not in columns:
            print("correct_countカラムを追加しています...")
            cursor.execute("ALTER TABLE words ADD COLUMN correct_count INTEGER DEFAULT 0")
        
        if 'wrong_count' not in columns:
            print("wrong_countカラムを追加しています...")
            cursor.execute("ALTER TABLE words ADD COLUMN wrong_count INTEGER DEFAULT 0")
        
        if 'last_studied' not in columns:
            print("last_studiedカラムを追加しています...")
            cursor.execute("ALTER TABLE words ADD COLUMN last_studied DATETIME")
        
        if 'mastered' not in columns:
            print("masteredカラムを追加しています...")
            cursor.execute("ALTER TABLE words ADD COLUMN mastered BOOLEAN DEFAULT 0")
        
        conn.commit()
        print("マイグレーションが完了しました！")
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        conn.rollback()
    finally:
        conn.close()
else:
    print("データベースファイルが見つかりません。初回起動時に自動的に作成されます。")

