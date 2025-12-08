import React, { useState, useEffect } from 'react';

function FlashCard({ word, direction, onFlip }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // カードが変わったときにリセット
  useEffect(() => {
    setIsFlipped(false);
  }, [word.id, direction]);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    if (onFlip && !isFlipped) {
      onFlip();
    }
  };

  const frontText = direction === 'word-to-meaning' ? word.word : word.meaning;
  const backText = direction === 'word-to-meaning' ? word.meaning : word.word;

  return (
    <div 
      className={`flashcard ${isFlipped ? 'flipped' : ''}`}
      onClick={handleClick}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="card-content">
            <p className="card-label">
              {direction === 'word-to-meaning' ? '単語' : '意味'}
            </p>
            <h2 className="card-text">{frontText}</h2>
            <p className="card-hint">クリックしてめくる</p>
          </div>
        </div>
        <div className="flashcard-back">
          <div className="card-content">
            <p className="card-label">
              {direction === 'word-to-meaning' ? '意味' : '単語'}
            </p>
            <h2 className="card-text">{backText}</h2>
            {word.mastered && (
              <span className="mastered-badge">マスター済み</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlashCard;

