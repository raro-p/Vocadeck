import React, { useState, useEffect } from 'react';
import HistoryChart from './HistoryChart';

const API_URL = '/api/stats';

function StudyHistory() {
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchDailyStats();
  }, [days]);

  const fetchDailyStats = async () => {
    try {
      const response = await fetch(`${API_URL}/daily?days=${days}`);
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const data = await response.json();
      setDailyStats(data);
    } catch (error) {
      console.error('学習履歴の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading) {
    return <p className="loading">読み込み中...</p>;
  }

  return (
    <div className="study-history">
      <div className="history-header">
        <h2>学習履歴</h2>
        <div className="history-controls">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="days-select"
          >
            <option value={7}>過去7日間</option>
            <option value={14}>過去14日間</option>
            <option value={30}>過去30日間</option>
            <option value={60}>過去60日間</option>
            <option value={90}>過去90日間</option>
          </select>
          <div className="chart-type-toggle">
            <button
              className={`btn-toggle ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              折れ線グラフ
            </button>
            <button
              className={`btn-toggle ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              棒グラフ
            </button>
          </div>
        </div>
      </div>

      {dailyStats.length === 0 ? (
        <div className="empty-state">
          <p>学習履歴がありません</p>
        </div>
      ) : (
        <>
          <div className="chart-container">
            <HistoryChart data={dailyStats} chartType={chartType} />
          </div>
          <div className="history-list">
            <h3>詳細データ</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>学習時間</th>
                  <th>学習単語数</th>
                  <th>正解数</th>
                  <th>不正解数</th>
                  <th>正答率</th>
                </tr>
              </thead>
              <tbody>
                {dailyStats.map((stat) => (
                  <tr key={stat.id}>
                    <td>{formatDate(stat.date)}</td>
                    <td>{formatTime(stat.study_time_seconds)}</td>
                    <td>{stat.words_studied}個</td>
                    <td>{stat.correct_count}</td>
                    <td>{stat.wrong_count}</td>
                    <td>{Math.round(stat.accuracy_rate)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default StudyHistory;

