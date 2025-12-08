import React from 'react';

function CardControls({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  direction,
  onDirectionChange,
  order,
  onOrderChange,
  onResetCard
}) {
  return (
    <div className="card-controls">
      <div className="control-group">
        <button
          className="btn-nav"
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          ← 前へ
        </button>
        <span className="card-counter">
          {currentIndex + 1} / {totalCards}
        </span>
        <button
          className="btn-nav"
          onClick={onNext}
          disabled={currentIndex === totalCards - 1}
        >
          次へ →
        </button>
      </div>
      
      <div className="control-group settings-group">
        <div className="settings-row">
          <button
            className={`btn-toggle ${direction === 'word-to-meaning' ? 'active' : ''}`}
            onClick={() => onDirectionChange('word-to-meaning')}
          >
            単語→意味
          </button>
          <button
            className={`btn-toggle ${direction === 'meaning-to-word' ? 'active' : ''}`}
            onClick={() => onDirectionChange('meaning-to-word')}
          >
            意味→単語
          </button>
          <button
            className={`btn-toggle ${order === 'sequential' ? 'active' : ''}`}
            onClick={() => onOrderChange('sequential')}
          >
            順番
          </button>
          <button
            className={`btn-toggle ${order === 'random' ? 'active' : ''}`}
            onClick={() => onOrderChange('random')}
          >
            ランダム
          </button>
        </div>
        {onResetCard && (
          <div className="settings-row">
            <button className="btn-reset" onClick={onResetCard}>
              カードをリセット
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardControls;

