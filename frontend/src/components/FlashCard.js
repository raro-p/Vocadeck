import React, { useState, useEffect } from 'react';

const COLOR_PRESETS = {
  blue: {
    front: 'linear-gradient(135deg, #4A90E2 0%, #2196F3 100%)',
    back: 'linear-gradient(135deg, #64B5F6 0%, #90CAF9 100%)'
  },
  green: {
    front: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
    back: 'linear-gradient(135deg, #81C784 0%, #A5D6A7 100%)'
  },
  orange: {
    front: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
    back: 'linear-gradient(135deg, #FFB74D 0%, #FFCC80 100%)'
  },
  purple: {
    front: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
    back: 'linear-gradient(135deg, #BA68C8 0%, #CE93D8 100%)'
  },
  red: {
    front: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
    back: 'linear-gradient(135deg, #EF5350 0%, #E57373 100%)'
  },
  teal: {
    front: 'linear-gradient(135deg, #009688 0%, #26A69A 100%)',
    back: 'linear-gradient(135deg, #26A69A 0%, #4DB6AC 100%)'
  },
};

function FlashCard({ word, direction, onFlip, colorPreset = 'blue' }) {
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
  
  const colors = COLOR_PRESETS[colorPreset] || COLOR_PRESETS.blue;

  return (
    <div 
      className={`flashcard ${isFlipped ? 'flipped' : ''}`}
      onClick={handleClick}
    >
      <div className="flashcard-inner">
        <div 
          className="flashcard-front"
          style={{ background: colors.front }}
        >
          <div className="card-content">
            <p className="card-label">
              {direction === 'word-to-meaning' ? '単語' : '意味'}
            </p>
            <h2 className="card-text">{frontText}</h2>
            <p className="card-hint">クリックしてめくる</p>
          </div>
        </div>
        <div 
          className="flashcard-back"
          style={{ background: colors.back }}
        >
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

