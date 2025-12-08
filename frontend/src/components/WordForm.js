import React, { useState, useEffect } from 'react';

function WordForm({ onSubmit, editingWord, onCancel }) {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');

  useEffect(() => {
    if (editingWord) {
      setWord(editingWord.word);
      setMeaning(editingWord.meaning);
    } else {
      setWord('');
      setMeaning('');
    }
  }, [editingWord]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (word.trim() && meaning.trim()) {
      onSubmit({ word: word.trim(), meaning: meaning.trim() });
      setWord('');
      setMeaning('');
    }
  };

  return (
    <form className="word-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="word">単語</label>
        <input
          type="text"
          id="word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="単語を入力"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="meaning">意味</label>
        <input
          type="text"
          id="meaning"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="意味を入力"
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          {editingWord ? '更新' : '追加'}
        </button>
        {editingWord && (
          <button type="button" className="btn-cancel" onClick={onCancel}>
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}

export default WordForm;

