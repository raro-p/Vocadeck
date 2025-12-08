import React from 'react';

function ProgressStats({ words }) {
  const totalWords = words.length;
  const masteredWords = words.filter(w => w.mastered).length;
  const totalCorrect = words.reduce((sum, w) => sum + (w.correct_count || 0), 0);
  const totalWrong = words.reduce((sum, w) => sum + (w.wrong_count || 0), 0);
  const totalAttempts = totalCorrect + totalWrong;
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const masteryRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

  return (
    <div className="progress-stats">
      <h3>学習進捗</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{totalWords}</div>
          <div className="stat-label">登録単語数</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{masteredWords}</div>
          <div className="stat-label">マスター済み</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{masteryRate}%</div>
          <div className="stat-label">マスター率</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">正答率</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalCorrect}</div>
          <div className="stat-label">正解数</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalWrong}</div>
          <div className="stat-label">不正解数</div>
        </div>
      </div>
    </div>
  );
}

export default ProgressStats;

