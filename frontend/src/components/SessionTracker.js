import React, { useState, useEffect, useRef } from 'react';

const API_URL = '/api/sessions';

function SessionTracker({ correctCount, wrongCount, wordsStudied, onSessionEnd }) {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // セッション開始
  const startSession = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_time: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const session = await response.json();
      setSessionId(session.id);
      setIsActive(true);
      startTimeRef.current = Date.now();
      
      // タイマー開始
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (error) {
      console.error('セッションの開始に失敗しました:', error);
      alert('セッションの開始に失敗しました');
    }
  };

  // セッション終了
  const endSession = async () => {
    if (!sessionId) return;

    try {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      const response = await fetch(`${API_URL}/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          end_time: new Date().toISOString(),
          correct_count: correctCount,
          wrong_count: wrongCount,
          words_studied: wordsStudied,
          duration_seconds: duration,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      
      const session = await response.json();
      
      // タイマー停止
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setIsActive(false);
      setElapsedTime(0);
      
      if (onSessionEnd) {
        onSessionEnd(session);
      }
    } catch (error) {
      console.error('セッションの終了に失敗しました:', error);
      alert('セッションの終了に失敗しました');
    }
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 時間をフォーマット（HH:MM:SS）
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalAttempts = correctCount + wrongCount;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  return (
    <div className="session-tracker">
      <div className="session-info">
        <div className="session-time">
          <span className="time-label">学習時間</span>
          <span className="time-value">{formatTime(elapsedTime)}</span>
        </div>
        <div className="session-stats">
          <div className="stat-item">
            <span className="stat-label">正解</span>
            <span className="stat-value">{correctCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">不正解</span>
            <span className="stat-value">{wrongCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">正答率</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
        </div>
      </div>
      <div className="session-controls">
        {!isActive ? (
          <button className="btn-start-session" onClick={startSession}>
            セッション開始
          </button>
        ) : (
          <button className="btn-end-session" onClick={endSession}>
            セッション終了
          </button>
        )}
      </div>
    </div>
  );
}

export default SessionTracker;

