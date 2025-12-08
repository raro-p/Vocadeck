import React from 'react';

function WordItem({ word, onEdit, onDelete }) {
  return (
    <div className="word-item">
      <div className="word-content">
        <h3 className="word-text">{word.word}</h3>
        <p className="word-meaning">{word.meaning}</p>
      </div>
      <div className="word-actions">
        <button className="btn-edit" onClick={() => onEdit(word)}>
          編集
        </button>
        <button className="btn-delete" onClick={() => onDelete(word.id)}>
          削除
        </button>
      </div>
    </div>
  );
}

export default WordItem;

