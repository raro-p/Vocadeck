import React from 'react';
import WordItem from './WordItem';

function WordList({ words, onEdit, onDelete }) {
  if (words.length === 0) {
    return (
      <div className="word-list empty">
        <p>単語が登録されていません。単語を追加してください。</p>
      </div>
    );
  }

  return (
    <div className="word-list">
      {words.map((word) => (
        <WordItem
          key={word.id}
          word={word}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default WordList;

