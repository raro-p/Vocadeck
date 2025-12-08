from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from database import Base

class Notebook(Base):
    __tablename__ = "notebooks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.now)
    
    # リレーションシップ
    words = relationship("Word", back_populates="notebook", cascade="all, delete-orphan")

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, index=True)
    meaning = Column(String)
    notebook_id = Column(Integer, ForeignKey("notebooks.id"), nullable=False, index=True)
    # 学習進捗フィールド
    correct_count = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)
    last_studied = Column(DateTime, nullable=True)
    mastered = Column(Boolean, default=False)
    
    # リレーションシップ
    notebook = relationship("Notebook", back_populates="words")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, default=datetime.now)
    end_time = Column(DateTime, nullable=True)
    correct_count = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)
    words_studied = Column(Integer, default=0)
    duration_seconds = Column(Integer, nullable=True)

class DailyStats(Base):
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, default=date.today, unique=True, index=True)
    study_time_seconds = Column(Integer, default=0)
    words_studied = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)
    accuracy_rate = Column(Float, default=0.0)

