from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, date, timedelta
import json

from database import get_db, engine
from models import Base, Word, StudySession, DailyStats, Notebook

# データベーステーブルを作成
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 起動時にエンドポイントをログ出力
@app.on_event("startup")
async def startup_event():
    print("\n" + "="*50)
    print("登録されているエンドポイント:")
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            print(f"  {list(route.methods)} {route.path}")
    print("="*50 + "\n")

# Pydanticモデル（リクエスト/レスポンス用）
class NotebookCreate(BaseModel):
    name: str

class NotebookSettingsUpdate(BaseModel):
    settings: Dict[str, Any]

class NotebookResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    settings: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class WordCreate(BaseModel):
    word: str
    meaning: str
    notebook_id: int

class WordResponse(BaseModel):
    id: int
    word: str
    meaning: str
    notebook_id: int
    correct_count: int = 0
    wrong_count: int = 0
    last_studied: Optional[datetime] = None
    mastered: bool = False

    class Config:
        from_attributes = True

class ProgressUpdate(BaseModel):
    correct: bool
    mastered: Optional[bool] = None

class WordImport(BaseModel):
    notebook_id: int
    text: str

class SessionCreate(BaseModel):
    start_time: Optional[datetime] = None

class SessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    correct_count: Optional[int] = None
    wrong_count: Optional[int] = None
    words_studied: Optional[int] = None
    duration_seconds: Optional[int] = None

class SessionResponse(BaseModel):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    correct_count: int
    wrong_count: int
    words_studied: int
    duration_seconds: Optional[int] = None

    class Config:
        from_attributes = True

class DailyStatsResponse(BaseModel):
    id: int
    date: date
    study_time_seconds: int
    words_studied: int
    correct_count: int
    wrong_count: int
    accuracy_rate: float

    class Config:
        from_attributes = True

# 単語帳一覧取得
@app.get("/api/notebooks", response_model=List[NotebookResponse])
def get_notebooks(db: Session = Depends(get_db)):
    notebooks = db.query(Notebook).order_by(Notebook.created_at.desc()).all()
    # settingsをJSON文字列から辞書に変換
    result = []
    for notebook in notebooks:
        notebook_dict = {
            "id": notebook.id,
            "name": notebook.name,
            "created_at": notebook.created_at,
            "settings": None
        }
        if notebook.settings:
            if isinstance(notebook.settings, str):
                try:
                    notebook_dict["settings"] = json.loads(notebook.settings)
                except (json.JSONDecodeError, TypeError):
                    notebook_dict["settings"] = None
            else:
                notebook_dict["settings"] = notebook.settings
        result.append(notebook_dict)
    return result

# 単語帳作成
@app.post("/api/notebooks", response_model=NotebookResponse)
def create_notebook(notebook: NotebookCreate, db: Session = Depends(get_db)):
    db_notebook = Notebook(name=notebook.name)
    db.add(db_notebook)
    db.commit()
    db.refresh(db_notebook)
    
    # settingsをJSON文字列から辞書に変換
    notebook_dict = {
        "id": db_notebook.id,
        "name": db_notebook.name,
        "created_at": db_notebook.created_at,
        "settings": None
    }
    if db_notebook.settings:
        if isinstance(db_notebook.settings, str):
            try:
                notebook_dict["settings"] = json.loads(db_notebook.settings)
            except (json.JSONDecodeError, TypeError):
                notebook_dict["settings"] = None
        else:
            notebook_dict["settings"] = db_notebook.settings
    return notebook_dict

# 単語帳設定取得（クエリパラメータ版）
@app.get("/api/notebook-settings")
def get_notebook_settings(notebook_id: int, db: Session = Depends(get_db)):
    print(f"[DEBUG] get_notebook_settings called with notebook_id={notebook_id}")
    return {
        "test": "query_param_version",
        "notebook_id": notebook_id,
        "exclude_mastered": False,
        "default_direction": "word-to-meaning",
        "default_order": "sequential",
        "card_colors": {
            "front": "blue",
            "back": "light-blue"
        }
    }

# 単語帳設定更新（クエリパラメータ版）
@app.put("/api/notebook-settings")
def update_notebook_settings(notebook_id: int, settings_update: NotebookSettingsUpdate, db: Session = Depends(get_db)):
    notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if notebook is None:
        raise HTTPException(status_code=404, detail="単語帳が見つかりません")
    
    try:
        # SQLiteではJSON型はTEXT型として保存されるため、文字列として保存する
        # SQLAlchemyのJSON型は自動的にシリアライズ/デシリアライズされるが、
        # SQLiteの場合は明示的にjson.dumps()を使用する方が安全
        notebook.settings = json.dumps(settings_update.settings, ensure_ascii=False)
        db.commit()
        db.refresh(notebook)
        
        # レスポンス用にパース
        if isinstance(notebook.settings, str):
            try:
                return json.loads(notebook.settings)
            except (json.JSONDecodeError, TypeError):
                return settings_update.settings
        return notebook.settings if notebook.settings is not None else settings_update.settings
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = traceback.format_exc()
        print(f"設定保存エラー: {error_detail}")
        raise HTTPException(status_code=500, detail=f"設定の保存に失敗しました: {str(e)}")

# 単語帳内の全単語の正解・不正解数をリセット
@app.post("/api/notebooks/{notebook_id}/reset-progress")
def reset_notebook_progress(notebook_id: int, db: Session = Depends(get_db)):
    notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if notebook is None:
        raise HTTPException(status_code=404, detail="単語帳が見つかりません")
    
    words = db.query(Word).filter(Word.notebook_id == notebook_id).all()
    for word in words:
        word.correct_count = 0
        word.wrong_count = 0
        word.mastered = False
        word.last_studied = None
    
    db.commit()
    return {"message": f"単語帳「{notebook.name}」の全単語の進捗をリセットしました"}

# 単語帳取得（ID指定）
@app.get("/api/notebooks/{notebook_id}", response_model=NotebookResponse)
def get_notebook(notebook_id: int, db: Session = Depends(get_db)):
    print(f"[DEBUG] get_notebook called with notebook_id={notebook_id}")
    notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if notebook is None:
        raise HTTPException(status_code=404, detail="単語帳が見つかりません")
    
    # settingsをJSON文字列から辞書に変換
    notebook_dict = {
        "id": notebook.id,
        "name": notebook.name,
        "created_at": notebook.created_at,
        "settings": None
    }
    if notebook.settings:
        if isinstance(notebook.settings, str):
            try:
                notebook_dict["settings"] = json.loads(notebook.settings)
            except (json.JSONDecodeError, TypeError):
                notebook_dict["settings"] = None
        else:
            notebook_dict["settings"] = notebook.settings
    return notebook_dict

# 単語帳更新
@app.put("/api/notebooks/{notebook_id}", response_model=NotebookResponse)
def update_notebook(notebook_id: int, notebook: NotebookCreate, db: Session = Depends(get_db)):
    db_notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if db_notebook is None:
        raise HTTPException(status_code=404, detail="単語帳が見つかりません")
    db_notebook.name = notebook.name
    db.commit()
    db.refresh(db_notebook)
    
    # settingsをJSON文字列から辞書に変換
    notebook_dict = {
        "id": db_notebook.id,
        "name": db_notebook.name,
        "created_at": db_notebook.created_at,
        "settings": None
    }
    if db_notebook.settings:
        if isinstance(db_notebook.settings, str):
            try:
                notebook_dict["settings"] = json.loads(db_notebook.settings)
            except (json.JSONDecodeError, TypeError):
                notebook_dict["settings"] = None
        else:
            notebook_dict["settings"] = db_notebook.settings
    return notebook_dict

# 単語帳削除
@app.delete("/api/notebooks/{notebook_id}")
def delete_notebook(notebook_id: int, db: Session = Depends(get_db)):
    db_notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if db_notebook is None:
        raise HTTPException(status_code=404, detail="単語帳が見つかりません")
    db.delete(db_notebook)
    db.commit()
    return {"message": "単語帳が削除されました"}

# 単語一覧取得（単語帳IDでフィルタリング）
@app.get("/api/words", response_model=List[WordResponse])
def get_words(notebook_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Word)
    if notebook_id is not None:
        query = query.filter(Word.notebook_id == notebook_id)
    words = query.offset(skip).limit(limit).all()
    return words

# 全単語帳を横断して単語を検索
@app.get("/api/words/search")
def search_words(q: str = "", db: Session = Depends(get_db)):
    if not q or len(q.strip()) == 0:
        return []
    
    # 単語と意味の両方を検索（大文字小文字を区別しない）
    # 単語帳名も含めて返す
    query = db.query(Word, Notebook.name).join(Notebook).filter(
        (Word.word.ilike(f"%{q}%")) | (Word.meaning.ilike(f"%{q}%"))
    ).all()
    
    results = [
        {
            "id": word.id,
            "word": word.word,
            "meaning": word.meaning,
            "correct_count": word.correct_count,
            "wrong_count": word.wrong_count,
            "mastered": word.mastered,
            "notebook_id": word.notebook_id,
            "notebook_name": notebook_name
        }
        for word, notebook_name in query
    ]
    return results

# 単語取得（ID指定）
@app.get("/api/words/{word_id}", response_model=WordResponse)
def get_word(word_id: int, db: Session = Depends(get_db)):
    word = db.query(Word).filter(Word.id == word_id).first()
    if word is None:
        raise HTTPException(status_code=404, detail="単語が見つかりません")
    return word

# 単語追加
@app.post("/api/words", response_model=WordResponse)
def create_word(word: WordCreate, db: Session = Depends(get_db)):
    # 単語帳の存在確認
    notebook = db.query(Notebook).filter(Notebook.id == word.notebook_id).first()
    if notebook is None:
        raise HTTPException(status_code=404, detail="単語帳が見つかりません")
    
    db_word = Word(word=word.word, meaning=word.meaning, notebook_id=word.notebook_id)
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word

# 単語を一括インポート（Markdown形式）
@app.post("/api/words/import")
def import_words(import_data: WordImport, db: Session = Depends(get_db)):
    import re
    
    # 単語帳の存在確認
    notebook = db.query(Notebook).filter(Notebook.id == import_data.notebook_id).first()
    if notebook is None:
        raise HTTPException(status_code=404, detail="単語帳が見つかりません")
    
    # Markdown形式をパース
    # 対応形式: "- word: meaning" または "* word: meaning"
    pattern = r'^[-*]\s*(.+?)\s*:\s*(.+)$'
    
    lines = import_data.text.strip().split('\n')
    added_words = []
    skipped_lines = []
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        if not line:
            continue
            
        match = re.match(pattern, line)
        if match:
            word_text = match.group(1).strip()
            meaning_text = match.group(2).strip()
            
            if word_text and meaning_text:
                db_word = Word(
                    word=word_text,
                    meaning=meaning_text,
                    notebook_id=import_data.notebook_id
                )
                db.add(db_word)
                added_words.append({"word": word_text, "meaning": meaning_text})
            else:
                skipped_lines.append({"line": line_num, "text": line, "reason": "空の単語または意味"})
        else:
            skipped_lines.append({"line": line_num, "text": line, "reason": "フォーマットが不正"})
    
    db.commit()
    
    return {
        "success": True,
        "added_count": len(added_words),
        "skipped_count": len(skipped_lines),
        "added_words": added_words,
        "skipped_lines": skipped_lines
    }

# 単語更新
@app.put("/api/words/{word_id}", response_model=WordResponse)
def update_word(word_id: int, word: WordCreate, db: Session = Depends(get_db)):
    db_word = db.query(Word).filter(Word.id == word_id).first()
    if db_word is None:
        raise HTTPException(status_code=404, detail="単語が見つかりません")
    db_word.word = word.word
    db_word.meaning = word.meaning
    db.commit()
    db.refresh(db_word)
    return db_word

# 単語削除
@app.delete("/api/words/{word_id}")
def delete_word(word_id: int, db: Session = Depends(get_db)):
    db_word = db.query(Word).filter(Word.id == word_id).first()
    if db_word is None:
        raise HTTPException(status_code=404, detail="単語が見つかりません")
    db.delete(db_word)
    db.commit()
    return {"message": "単語が削除されました"}

# 学習進捗更新
@app.put("/api/words/{word_id}/progress", response_model=WordResponse)
def update_progress(word_id: int, progress: ProgressUpdate, db: Session = Depends(get_db)):
    db_word = db.query(Word).filter(Word.id == word_id).first()
    if db_word is None:
        raise HTTPException(status_code=404, detail="単語が見つかりません")
    
    if progress.correct:
        db_word.correct_count += 1
    else:
        db_word.wrong_count += 1
    
    db_word.last_studied = datetime.now()
    
    if progress.mastered is not None:
        db_word.mastered = progress.mastered
    
    db.commit()
    db.refresh(db_word)
    return db_word

# 間違えた単語のみを取得（単語帳IDでフィルタリング）
@app.get("/api/words/wrong-only", response_model=List[WordResponse])
def get_wrong_words(notebook_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Word).filter(Word.wrong_count > 0)
    if notebook_id is not None:
        query = query.filter(Word.notebook_id == notebook_id)
    words = query.all()
    return words

# セッション作成
@app.post("/api/sessions", response_model=SessionResponse)
def create_session(session: SessionCreate, db: Session = Depends(get_db)):
    db_session = StudySession(
        start_time=session.start_time or datetime.now()
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

# セッション更新
@app.put("/api/sessions/{session_id}", response_model=SessionResponse)
def update_session(session_id: int, session_update: SessionUpdate, db: Session = Depends(get_db)):
    db_session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if db_session is None:
        raise HTTPException(status_code=404, detail="セッションが見つかりません")
    
    if session_update.end_time is not None:
        db_session.end_time = session_update.end_time
    if session_update.correct_count is not None:
        db_session.correct_count = session_update.correct_count
    if session_update.wrong_count is not None:
        db_session.wrong_count = session_update.wrong_count
    if session_update.words_studied is not None:
        db_session.words_studied = session_update.words_studied
    if session_update.duration_seconds is not None:
        db_session.duration_seconds = session_update.duration_seconds
    
    db.commit()
    db.refresh(db_session)
    
    # 日々の統計を更新
    update_daily_stats(db, db_session)
    
    return db_session

# 日々の統計を更新
def update_daily_stats(db: Session, session: StudySession):
    today = date.today()
    daily_stat = db.query(DailyStats).filter(DailyStats.date == today).first()
    
    if daily_stat is None:
        total_attempts = session.correct_count + session.wrong_count
        accuracy = (session.correct_count / total_attempts * 100) if total_attempts > 0 else 0.0
        daily_stat = DailyStats(
            date=today,
            study_time_seconds=session.duration_seconds or 0,
            words_studied=session.words_studied,
            correct_count=session.correct_count,
            wrong_count=session.wrong_count,
            accuracy_rate=accuracy
        )
        db.add(daily_stat)
    else:
        daily_stat.study_time_seconds += session.duration_seconds or 0
        daily_stat.words_studied += session.words_studied
        daily_stat.correct_count += session.correct_count
        daily_stat.wrong_count += session.wrong_count
        total_attempts = daily_stat.correct_count + daily_stat.wrong_count
        daily_stat.accuracy_rate = (daily_stat.correct_count / total_attempts * 100) if total_attempts > 0 else 0.0
    
    db.commit()

# 日々の統計取得
@app.get("/api/stats/daily", response_model=List[DailyStatsResponse])
def get_daily_stats(days: int = 30, db: Session = Depends(get_db)):
    start_date = date.today() - timedelta(days=days)
    stats = db.query(DailyStats).filter(DailyStats.date >= start_date).order_by(DailyStats.date).all()
    return stats

# 最新のセッション取得
@app.get("/api/sessions/latest", response_model=Optional[SessionResponse])
def get_latest_session(db: Session = Depends(get_db)):
    session = db.query(StudySession).order_by(StudySession.start_time.desc()).first()
    return session

@app.get("/")
def root():
    return {"message": "単語帳API"}

